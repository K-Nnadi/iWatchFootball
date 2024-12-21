import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {NestApplicationOptions} from "@nestjs/common";
import {writeFileSync} from "fs";


export const SWAGGER_DOCUMENT =  new DocumentBuilder()
    .setTitle('I Watch Football API')
    .setDescription('The API Docs for I Watch Football')
    .setVersion('1.0')
    .build();

export async function GenericBootstrap(module: any, port: number) {
    const fastifyAdapter = new FastifyAdapter() as NestApplicationOptions

    // @ts-ignore
    const app = await NestFactory.create<NestFastifyApplication>(
        module,
        fastifyAdapter
    );
    app.enableCors({
        origin: 'http://localhost:3001',
        credentials: true,
    })


    const document = SwaggerModule.createDocument(app, SWAGGER_DOCUMENT, {ignoreGlobalPrefix: false});
    SwaggerModule.setup('api-docs', app, document);
    writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

    await app.listen(port);
}
