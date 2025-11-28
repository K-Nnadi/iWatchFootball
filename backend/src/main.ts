import {AppModule} from "./app.module";
import {GenericBootstrap} from "@iWatchFootball/base-tools/bootstrap/generic.bootstrap";
import {config} from "dotenv";
import {GlobalAuthGuard} from "./auth/guards/global-auth.guard";
import {SecurityInterceptor} from "./auth/interceptors/security.interceptor";

console.log('='.repeat(60));
console.log('🚀 Starting IWatchFootball Backend');
console.log('='.repeat(60));

// Load environment variables
config();
console.log('✅ Environment variables loaded');

// Log environment info (safely, without secrets)
const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    PORT: process.env.PORT || 8080,
    DATABASE_HOST: process.env.DATABASE_HOST ? '***set***' : 'not set',
    DATABASE_PORT: process.env.DATABASE_PORT || 'not set',
    DATABASE_NAME: process.env.DATABASE_NAME ? '***set***' : 'not set',
    DATABASE_USERNAME: process.env.DATABASE_USERNAME ? '***set***' : 'not set',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? '***set***' : 'not set',
    DATABASE_SSL: process.env.DATABASE_SSL || 'not set',
    DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE || 'not set',
    JWT_SECRET: process.env.JWT_SECRET ? '***set***' : 'not set',
    REDIS_HOST: process.env.REDIS_HOST ? '***set***' : 'not set',
    REDIS_PORT: process.env.REDIS_PORT || 'not set',
};
console.log('📋 Environment Configuration:', JSON.stringify(envInfo, null, 2));

const port = Number(process.env.PORT) || 8080;
console.log(`🔌 Attempting to start server on port: ${port}`);

console.log('⏳ Initializing application...');
GenericBootstrap(AppModule, port, {
    enableAuth: true,
    GlobalAuthGuard,
    SecurityInterceptor
}).catch((error) => {
    console.error('='.repeat(60));
    console.error('❌ FATAL ERROR: Failed to start server');
    console.error('='.repeat(60));
    console.error('Error message:', error?.message || 'Unknown error');
    console.error('Error stack:', error?.stack || 'No stack trace available');
    if (error?.cause) {
        console.error('Error cause:', error.cause);
    }
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('='.repeat(60));
    process.exit(1);
});
