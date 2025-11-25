import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {NestApplicationOptions} from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import {writeFileSync} from "fs";
import {getMetadataArgsStorage} from "typeorm";
import * as fs from 'fs';



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
        const fastifyAdapter = new FastifyAdapter() as NestApplicationOptions;
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
                'http://localhost:3000',
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
        
        // Only write openapi.json if we have write permissions (skip in Cloud Run)
        try {
            fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
            console.log('✅ OpenAPI JSON file written');
        } catch (error) {
            console.warn('⚠️  Could not write openapi.json file (this is OK in production):', error);
        }

        console.log('📦 Step 7/7: Starting server and binding to port...');
        console.log(`   Attempting to listen on host: 0.0.0.0, port: ${port}`);
        
        await app.listen(port, '0.0.0.0');
        
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
