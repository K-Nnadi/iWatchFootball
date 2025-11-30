import { spawn } from 'child_process';
import { config } from 'dotenv';
import { existsSync } from 'fs';

config();

function getArg(name: string): string | undefined {
	const args = process.argv.slice(2);
	for (const arg of args) {
		if (arg.startsWith(`--${name}=`)) {
			return arg.split('=')[1];
		}
		if (arg === `--${name}`) {
			const index = args.indexOf(arg);
			return args[index + 1];
		}
	}
	return undefined;
}

function getInstance(environment?: string): string {
	if (environment) {
		const envKey = `CLOUD_SQL_INSTANCE_${environment.toUpperCase()}`;
		if (process.env[envKey]) return process.env[envKey]!;
	}
	if (process.env.CLOUD_SQL_INSTANCE) return process.env.CLOUD_SQL_INSTANCE;
	
	console.error('❌ Cloud SQL instance not found.');
	console.error(`   Set CLOUD_SQL_INSTANCE environment variable${environment ? ` or CLOUD_SQL_INSTANCE_${environment.toUpperCase()}` : ''}`);
	console.error('   Example: CLOUD_SQL_INSTANCE=project:region:instance');
	process.exit(1);
}

function getProxyPath(): string {
	const customPath = getArg('proxy-path') || process.env.CLOUD_SQL_PROXY_PATH;
	if (customPath) {
		if (!existsSync(customPath)) {
			console.error(`❌ Cloud SQL Proxy not found at: ${customPath}`);
			process.exit(1);
		}
		return customPath;
	}

	const exeName = process.platform === 'win32' ? 'cloud-sql-proxy.exe' : 'cloud-sql-proxy';
	return exeName;
}

export function runProxy(): void {
	const port = getArg('port') || process.env.CLOUD_SQL_PORT || '5432';
	const environment = getArg('environment') || process.env.NODE_ENV || 'development';
	const instance = getInstance(environment);
	const proxyPath = getProxyPath();

	console.log('🚀 Starting Cloud SQL Proxy...');
	console.log(`   Environment: ${environment}`);
	console.log(`   Instance: ${instance}`);
	console.log(`   Port: ${port}`);
	console.log(`   Proxy: ${proxyPath}`);

	const proxy = spawn(proxyPath, [`--port=${port}`, instance], {
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});

	proxy.on('error', (error) => {
		console.error('❌ Failed to start:', error.message);
		console.error('   Make sure cloud-sql-proxy is installed and in your PATH');
		console.error('   Or set CLOUD_SQL_PROXY_PATH environment variable');
		console.error('   Install: https://cloud.google.com/sql/docs/postgres/sql-proxy#install');
		process.exit(1);
	});

	proxy.on('exit', (code) => {
		if (code && code !== 0) {
			console.error(`❌ Exited with code ${code}`);
			process.exit(code);
		}
	});

	const shutdown = () => {
		console.log('\n🛑 Shutting down...');
		proxy.kill();
		process.exit(0);
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

if (require.main === module) {
	runProxy();
}

