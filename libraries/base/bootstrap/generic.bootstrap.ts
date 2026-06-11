import {NestFactory, Reflector} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {NestApplicationOptions} from "@nestjs/common";
import * as fs from "fs";
import {getMetadataArgsStorage} from "typeorm";
import helmet from '@fastify/helmet';

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'https://iwatchfootball.web.app'];
const DEFAULT_BODY_LIMIT_BYTES = 1_048_576;

function resolveCorsOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS;
    if (raw == null || raw.trim() === '') return DEFAULT_CORS_ORIGINS;
    const parsed = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : DEFAULT_CORS_ORIGINS;
}

function resolveBodyLimit(): number {
    const raw = process.env.BODY_LIMIT_BYTES;
    if (raw == null || raw === '') return DEFAULT_BODY_LIMIT_BYTES;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_BODY_LIMIT_BYTES;
}


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
        // Disable Fastify's default logger to reduce noise - we use our own prefixed logs
        const bodyLimit = resolveBodyLimit();
        const fastifyAdapter = new FastifyAdapter({
            logger: false,
            bodyLimit,
        }) as NestApplicationOptions;
        console.log('✅ Fastify adapter created');

        console.log('📦 Step 2/7: Loading TypeORM entities...');
        const entities = getMetadataArgsStorage().tables.map((tbl) => tbl.name);
        console.log(`✅ Loaded ${entities.length} entities:`, entities);

        console.log('📦 Step 3/7: Creating NestJS application...');
        console.log('[APP]    This step will connect to the database and run migrations...');
        const startTime = Date.now();
        // @ts-ignore
        const app = await NestFactory.create<NestFastifyApplication>(
            module,
            fastifyAdapter
        );
        const initTime = Date.now() - startTime;
        console.log(`✅ NestJS application created successfully (took ${initTime}ms)`);

        try {
            const fastifyInstance = app.getHttpAdapter().getInstance();

            // Cast avoids TS2769 when pnpm resolves multiple fastify versions (e.g. 4.28 vs 4.29).
            const registerPlugin = (fastifyInstance as unknown as {
                register: (plugin: unknown, opts?: unknown) => PromiseLike<unknown>;
            }).register.bind(fastifyInstance);
            await registerPlugin(helmet, {
                contentSecurityPolicy: false,
                crossOriginEmbedderPolicy: false,
            });
            console.log('✅ Security headers (helmet) registered');

            if (process.env.REQUEST_LOGGING !== 'false') {
                fastifyInstance.addHook('onRequest', async (request) => {
                    (request as { _requestStartMs?: number })._requestStartMs = Date.now();
                });
                fastifyInstance.addHook('onResponse', async (request, reply) => {
                    const started = (request as { _requestStartMs?: number })._requestStartMs ?? Date.now();
                    const trace = request.headers['x-cloud-trace-context'];
                    const requestId = typeof trace === 'string' ? trace.split('/')[0] : undefined;
                    const path = request.routerPath ?? request.url?.split('?')[0] ?? request.url;
                    console.log(JSON.stringify({
                        level: 'info',
                        type: 'http',
                        method: request.method,
                        path,
                        statusCode: reply.statusCode,
                        durationMs: Date.now() - started,
                        requestId,
                    }));
                });
                console.log('✅ Structured HTTP request logging enabled');
            }

            // Stripe webhooks require the raw request body for signature verification
            fastifyInstance.addHook('preParsing', async (request, _reply, payload) => {
                if (!request.url?.startsWith('/webhooks/stripe')) {
                    return payload;
                }
                const chunks: Buffer[] = [];
                for await (const chunk of payload as AsyncIterable<Buffer>) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                }
                const rawBody = Buffer.concat(chunks);
                (request as { rawBody?: Buffer }).rawBody = rawBody;
                return rawBody;
            });
            console.log('✅ Fastify preParsing hook registered for /webhooks/stripe raw body');
        } catch (rawBodyError) {
            console.warn('⚠️  Could not register Stripe raw-body hook:', rawBodyError);
        }

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
        const corsOrigins = resolveCorsOrigins();
        app.enableCors({
            origin: corsOrigins,
            credentials: true,
        });
        console.log(`✅ CORS configured for origins: ${corsOrigins.join(', ')}`);

        console.log('📦 Step 6/7: Setting up Swagger/OpenAPI documentation...');
        const document = SwaggerModule.createDocument(app, SWAGGER_DOCUMENT, {ignoreGlobalPrefix: false});

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

        /** After stripping broken relation properties, OpenAPI still lists them in `required` — Swagger UI then crashes ("Could not render responses"). */
        function pruneOrphanRequiredDeep(node: unknown): void {
            if (node === null || node === undefined) return;
            if (Array.isArray(node)) {
                node.forEach(pruneOrphanRequiredDeep);
                return;
            }
            if (typeof node !== 'object') return;

            const obj = node as Record<string, unknown>;
            const props = obj.properties;
            const req = obj.required;
            if (
                props &&
                typeof props === 'object' &&
                !Array.isArray(props) &&
                Array.isArray(req)
            ) {
                const keys = Object.keys(props as object);
                const filtered = (req as string[]).filter((r) => keys.includes(r));
                if (filtered.length === 0) {
                    delete obj.required;
                } else if (filtered.length !== req.length) {
                    obj.required = filtered;
                }
            }

            for (const value of Object.values(obj)) {
                pruneOrphanRequiredDeep(value);
            }
        }

        const cleanedDocument = cleanRefs(document);
        pruneOrphanRequiredDeep(cleanedDocument);

        const exposeApiDocs =
            process.env.NODE_ENV !== 'production' || process.env.EXPOSE_API_DOCS === 'true';

        if (exposeApiDocs) {
            SwaggerModule.setup('api-docs', app, cleanedDocument, {
                swaggerOptions: {
                    docExpansion: 'none',
                },
            });
            console.log('✅ Swagger documentation setup complete');
        } else {
            console.log('🔒 Swagger disabled in production (set EXPOSE_API_DOCS=true to enable)');
        }

        try {
            if (process.env.NODE_ENV !== 'production') {
                fs.writeFileSync('./openapi.json', JSON.stringify(cleanedDocument, null, 2));
                console.log('✅ OpenAPI JSON file written (cleaned empty $ref values)');
            }
        } catch (error) {
            console.warn('⚠️  Could not write openapi.json file (this is OK in production):', error);
        }

        console.log('📦 Step 7/7: Starting server and binding to port...');
        console.log(`[APP]    Attempting to listen on host: 0.0.0.0, port: ${port}`);
        console.log(`[APP]    PORT environment variable: ${process.env.PORT || 'not set (using default 8080)'}`);
        
        // For Cloud Run/Docker, we need to listen on 0.0.0.0 to accept connections from outside the container
        // NestJS Fastify listen method accepts port and host as separate arguments
        // Using '0.0.0.0' ensures the server listens on all network interfaces (not just localhost)
        try {
            await app.listen(port, '0.0.0.0');
            console.log(`[APP]    ✅ Server successfully bound to 0.0.0.0:${port}`);
        } catch (listenError) {
            console.error(`[APP]    ❌ Failed to bind to 0.0.0.0:${port}`);
            console.error(`[APP]    Error:`, listenError);
            throw listenError;
        }
        
        console.log('='.repeat(60));
        console.log(`✅ SUCCESS: Server is now running on port ${port}`);
        console.log(`[APP]    Health check endpoint: http://localhost:${port}/health`);
        console.log(`[APP]    API docs endpoint: http://localhost:${port}/api-docs`);
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
                        console.error(`[APP]   ${key}:`, (error as any)[key]);
                    } catch (e) {
                        console.error(`[APP]   ${key}: [could not serialize]`);
                    }
                }
            }
        }
        console.error('='.repeat(60));
        throw error; // Re-throw to be caught by main.ts
    }
}
