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
    const fastifyAdapter = new FastifyAdapter() as NestApplicationOptions
    console.log('Loaded Entities:', getMetadataArgsStorage().tables.map((tbl) => tbl.name));

    // @ts-ignore
    const app = await NestFactory.create<NestFastifyApplication>(
        module,
        fastifyAdapter
    );

    // Add global authentication guard and security interceptor if enabled
    if (options?.enableAuth && options.GlobalAuthGuard && options.SecurityInterceptor) {
        const reflector = app.get(Reflector);
        app.useGlobalGuards(new options.GlobalAuthGuard(reflector));
        app.useGlobalInterceptors(new options.SecurityInterceptor(reflector));
    }

    app.enableCors({
        origin: [
            'http://localhost:3000',
            'https://iwatchfootball.web.app',
        ],
        credentials: true,
    })

    const document = SwaggerModule.createDocument(app, SWAGGER_DOCUMENT, {ignoreGlobalPrefix: false});
    SwaggerModule.setup('api-docs', app, document);
    fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

    await app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}
