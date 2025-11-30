import {AppModule} from "./app.module";
import {GenericBootstrap} from "@iWatchFootball/base-tools/bootstrap/generic.bootstrap";
import {config} from "dotenv";
import {GlobalAuthGuard} from "./auth/guards/global-auth.guard";
import {SecurityInterceptor} from "./auth/interceptors/security.interceptor";

console.log('='.repeat(60));
console.log('🚀 Starting IWatchFootball Backend');
console.log( '='.repeat(60));

// Load environment variables
config();
console.log('✅ Environment variables loaded');

// Log environment info (safely, without secrets)
const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 8080,
    DATABASE_HOST: process.env.DATABASE_HOST ? '***set***' : 'not set',
    DATABASE_PORT: process.env.DATABASE_PORT || 'not set',
    DATABASE_NAME: process.env.DATABASE_NAME || 'not set',
    DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'not set',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'not set',
    DATABASE_SSL: process.env.DATABASE_SSL || 'not set',
    DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE || 'not set',
    JWT_SECRET: process.env.JWT_SECRET || 'not set',
    REDIS_HOST: process.env.REDIS_HOST || 'not set',
    REDIS_PORT: process.env.REDIS_PORT || 'not set',
};
console.log('📋 Environment Configuration:', JSON.stringify(envInfo, null, 2));

// Cloud Run automatically sets PORT environment variable
// If not set, default to 8080 (Cloud Run's default)
const port = Number(process.env.PORT) || 8080;
if (!process.env.PORT) {
    console.warn(`⚠️  PORT environment variable not set, using default: ${port}`);
} else {
    console.log(`✅ PORT environment variable set: ${process.env.PORT}`);
}
console.log(`🔌 Attempting to start server on port: ${port}`);

// Cloud Run has a 4-minute startup timeout, so we'll set our own timeout slightly before that
const STARTUP_TIMEOUT_MS = 3.5 * 60 * 1000; // 3.5 minutes
console.log(`⏱️  Startup timeout set to ${STARTUP_TIMEOUT_MS / 1000}s`);

console.log('⏳ Initializing application...');
const startTime = Date.now();

// Wrap bootstrap in a timeout to catch hanging operations
const bootstrapPromise = GenericBootstrap(AppModule, port, {
    enableAuth: true,
    GlobalAuthGuard,
    SecurityInterceptor
});

const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
        const elapsed = Date.now() - startTime;
        reject(new Error(`Startup timeout after ${elapsed}ms (${elapsed / 1000}s). The application may be hanging on database connection or migrations.`));
    }, STARTUP_TIMEOUT_MS);
});

Promise.race([bootstrapPromise, timeoutPromise])
    .catch((error) => {
        const elapsed = Date.now() - startTime;
        console.error('='.repeat(60));
        console.error('❌ FATAL ERROR: Failed to start server');
        console.error('='.repeat(60));
        console.error(`Startup time: ${elapsed}ms (${(elapsed / 1000).toFixed(2)}s)`);
        console.error('Error message:', error?.message || 'Unknown error');
        console.error('Error stack:', error?.stack || 'No stack trace available');
        if (error?.cause) {
            console.error('Error cause:', error.cause);
        }
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('='.repeat(60));
        console.error('💡 TROUBLESHOOTING TIPS:');
        console.error('[APP]    1. Check database connection settings (host, port, credentials)');
        console.error('[APP]    2. Verify database is accessible from Cloud Run');
        console.error('[APP]    3. Check if migrations are taking too long');
        console.error('[APP]    4. Review Cloud SQL connection logs');
        console.error('[APP]    5. Ensure DATABASE_HOST points to correct Cloud SQL instance');
        console.error('='.repeat(60));
        process.exit(1);
    });
