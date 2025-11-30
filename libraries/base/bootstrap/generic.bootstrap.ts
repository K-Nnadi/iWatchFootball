import {NestFactory, Reflector} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {NestApplicationOptions} from "@nestjs/common";
import * as fs from "fs";
import {getMetadataArgsStorage} from "typeorm";


export const SWAGGER_DOCUMENT =  new DocumentBuilder()
    .setTitle('I Watch Football API')
    .setDescription('The API Docs for I Watch Football')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

export async function GenericBootstrap(module: any, port: number, options?: {
    enableAuth?: boolean;
    GlobalAuthGuard?: any;
    SecurityInterceptor?: any;
}) {
    try {
        console.log('📦 Step 1/7: Creating Fastify adapter...');
        // Configure Fastify to listen on 0.0.0.0 for Docker/Cloud Run compatibility
        const fastifyAdapter = new FastifyAdapter({
            logger: true,
        }) as NestApplicationOptions;
        console.log('✅ Fastify adapter created');

        console.log('📦 Step 2/7: Loading TypeORM entities...');
        const entities = getMetadataArgsStorage().tables.map((tbl) => tbl.name);
        console.log(`✅ Loaded ${entities.length} entities:`, entities);

        console.log('📦 Step 3/7: Creating NestJS application...');
        // @ts-ignore
        const app = await NestFactory.create<NestFastifyApplication>(
            module,
            fastifyAdapter
        );
        console.log('✅ NestJS application created successfully');

        // Add global authentication guard and security interceptor if enabled
        if (options?.enableAuth && options.GlobalAuthGuard && options.SecurityInterceptor) {
            console.log('📦 Step 4/7: Setting up authentication guards and interceptors...');
            const reflector = app.get(Reflector);
            app.useGlobalGuards(new options.GlobalAuthGuard(reflector));
            app.useGlobalInterceptors(new options.SecurityInterceptor(reflector));
            console.log('✅ Authentication guards and interceptors configured');
        } else {
            console.log('⚠️  Step 4/7: Skipping authentication setup (not enabled)');
        }

        console.log('📦 Step 5/7: Configuring CORS...');
        app.enableCors({
            origin: [
                'http://localhost:5173',
                'https://iwatchfootball.web.app',
            ],
            credentials: true,
        });
        console.log('✅ CORS configured');

        console.log('📦 Step 6/7: Setting up Swagger/OpenAPI documentation...');
        const document = SwaggerModule.createDocument(app, SWAGGER_DOCUMENT, {ignoreGlobalPrefix: false});
        SwaggerModule.setup('api-docs', app, document, {
            swaggerOptions: {
                docExpansion: 'none', // All accordions closed by default
            },
        });
        console.log('✅ Swagger documentation setup complete');
        
        // Clean up empty $ref values that can occur with lazy-loaded relations
        function hasEmptyRef(obj: any): boolean {
            if (obj && typeof obj === 'object') {
                if ('$ref' in obj) {
                    const ref = obj.$ref;
                    return !ref || ref === '#/components/schemas/' || ref.endsWith('/');
                }
                if ('allOf' in obj && Array.isArray(obj.allOf)) {
                    return obj.allOf.every((item: any) => hasEmptyRef(item));
                }
            }
            return false;
        }

        function cleanRefs(obj: any, isProperty = false): any {
            if (Array.isArray(obj)) {
                return obj.map((item: any) => cleanRefs(item, isProperty)).filter((item: any) => !hasEmptyRef(item) && item !== undefined);
            } else if (obj && typeof obj === 'object') {
                const cleaned: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    // Skip properties with empty $ref or empty allOf
                    if (hasEmptyRef(value)) {
                        continue;
                    }
                    // Clean allOf arrays
                    if (key === 'allOf' && Array.isArray(value)) {
                        const cleanedAllOf = cleanRefs(value, isProperty).filter((item: any) => !hasEmptyRef(item) && item !== undefined);
                        if (cleanedAllOf.length > 0) {
                            cleaned[key] = cleanedAllOf;
                        }
                        // If allOf becomes empty, skip this property entirely
                    } else {
                        const cleanedValue = cleanRefs(value, key === 'properties');
                        if (cleanedValue !== undefined) {
                            cleaned[key] = cleanedValue;
                        }
                    }
                }
                // Final check: if object is an array type, ensure it has items
                if (cleaned.type === 'array' && !cleaned.items) {
                    // Remove invalid array definitions (especially in properties)
                    if (isProperty) {
                        return undefined;
                    }
                    // For top-level schemas, we might want to keep it but Orval will error, so remove it
                    return undefined;
                }
                return cleaned;
            }
            return obj;
        }

        const cleanedDocument = cleanRefs(document);
        
        // Only write openapi.json if we have write permissions (skip in Cloud Run)
        try {
            fs.writeFileSync('./openapi.json', JSON.stringify(cleanedDocument, null, 2));
            console.log('✅ OpenAPI JSON file written (cleaned empty $ref values)');
        } catch (error) {
            console.warn('⚠️  Could not write openapi.json file (this is OK in production):', error);
        }

        console.log('📦 Step 7/7: Starting server and binding to port...');
        console.log(`   Attempting to listen on host: 0.0.0.0, port: ${port}`);
        console.log(`   PORT environment variable: ${process.env.PORT || 'not set (using default 8080)'}`);
        
        // For Cloud Run/Docker, we need to listen on 0.0.0.0 to accept connections from outside the container
        // NestJS Fastify listen method accepts port and host as separate arguments
        // Using '0.0.0.0' ensures the server listens on all network interfaces (not just localhost)
        try {
            await app.listen(port, '0.0.0.0');
            console.log(`   ✅ Server successfully bound to 0.0.0.0:${port}`);
        } catch (listenError) {
            console.error(`   ❌ Failed to bind to 0.0.0.0:${port}`);
            console.error(`   Error:`, listenError);
            throw listenError;
        }
        
        console.log('='.repeat(60));
        console.log(`✅ SUCCESS: Server is now running on port ${port}`);
        console.log(`   Health check endpoint: http://localhost:${port}/health`);
        console.log(`   API docs endpoint: http://localhost:${port}/api-docs`);
        console.log('='.repeat(60));
    } catch (error: unknown) {
        console.error('='.repeat(60));
        console.error('❌ ERROR in GenericBootstrap');
        console.error('='.repeat(60));
        
        if (error instanceof Error) {
            console.error('Error type:', error.constructor?.name || 'Unknown');
            console.error('Error message:', error.message || 'Unknown error');
            console.error('Error stack:', error.stack || 'No stack trace available');
            if ('cause' in error && error.cause) {
                console.error('Error cause:', error.cause);
            }
        } else {
            console.error('Error (non-Error object):', error);
        }
        
        // Log all error properties
        if (error && typeof error === 'object') {
            console.error('Error properties:', Object.keys(error));
            for (const key of Object.keys(error)) {
                if (key !== 'stack' && key !== 'message') {
                    try {
                        console.error(`  ${key}:`, (error as any)[key]);
                    } catch (e) {
                        console.error(`  ${key}: [could not serialize]`);
                    }
                }
            }
        }
        console.error('='.repeat(60));
        throw error; // Re-throw to be caught by main.ts
    }
}
