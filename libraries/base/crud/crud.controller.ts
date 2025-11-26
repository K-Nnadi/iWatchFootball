import {DeepPartial} from 'typeorm';
import {
    Body,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req, Res,
    Type, UploadedFile, UseInterceptors
} from '@nestjs/common';
import {ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiPropertyOptional, ApiQuery} from '@nestjs/swagger';
import {CrudInterface} from "./crud.interface";
import {FastifyReply, FastifyRequest} from "fastify";
import {QS_OPTIONS} from "./query.options";
import * as fs from 'fs';
import * as path from 'path';
import qs from 'qs';


export class QueryOptions<T> {
    @ApiPropertyOptional({type: Number})
    skip?: number;
    @ApiPropertyOptional({type: Number})
    take?: number;
    @ApiPropertyOptional({type: 'object', additionalProperties: { type: 'boolean' }})
    select?: { [P in keyof T]?: boolean };
    @ApiPropertyOptional()
    where?: { [P in keyof T]?: T[P] } | { [P in keyof T]?: T[P] }[];
    @ApiPropertyOptional({type: 'object', additionalProperties: { type: 'boolean' }})
    relations?: { [P in keyof T]?: boolean };
    @ApiPropertyOptional({type: 'object', additionalProperties: { type: 'boolean' }})
    order?: { [P in keyof T]?: boolean };
    @ApiPropertyOptional()
    withDeleted?: boolean;
    @ApiPropertyOptional()
    loadEagerRelations?: boolean;
    @ApiPropertyOptional()
    transaction?: boolean;
    @ApiPropertyOptional()
    comment?: string;
}


export interface ControllerInterface<T, U> extends Omit<CrudInterface<T, U>, "getQuery"> {
    getQuery(request: FastifyRequest, skip?: number, take?: number, withDeleted?: boolean, loadEagerRelations?: boolean, transaction?: boolean, comment?: string, where?: any): Promise<T[]>
    getCount(request: FastifyRequest, withDeleted?: boolean, transaction?: boolean, comment?: string, where?: any): Promise<number>
}


export const CrudController = <T, U>(entity: any, createDTO: any): Type<ControllerInterface<T, U>> => {
    class crudController<T> implements ControllerInterface<T, U> {
        constructor(private readonly service: CrudInterface<T, U>) {
        }

        @Post()
        @ApiOperation({summary: `Create ${entity.name}`, operationId: `create${entity.name}`})
        @ApiOkResponse({type: entity})
        @ApiBody({type: createDTO})
        create(@Body() entity: typeof createDTO) {
            return this.service.create(entity);
        }

        @Get()
        @ApiOperation({summary: `Get all ${entity.name}s`, operationId: `getAll${entity.name}`})
        @ApiOkResponse({type: entity, isArray: true})
        getAll() {
            return this.service.getAll();
        }

        @Get('query')
        @ApiOperation({summary: `Get all ${entity.name}s`, operationId: `getQuery${entity.name}`})
        @ApiOkResponse({type: entity, isArray: true})
        @ApiQuery({name: 'skip', required: false, type: Number, description: 'Number of records to skip'})
        @ApiQuery({name: 'take', required: false, type: Number, description: 'Number of records to take'})
        @ApiQuery({name: 'withDeleted', required: false, type: Boolean, description: 'Include soft deleted records'})
        @ApiQuery({name: 'loadEagerRelations', required: false, type: Boolean, description: 'Load eager relations'})
        @ApiQuery({name: 'transaction', required: false, type: Boolean, description: 'Use transaction'})
        @ApiQuery({name: 'comment', required: false, type: String, description: 'Query comment'})
        getQuery(@Req() request: FastifyRequest,
                 @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
                 @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
                 @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
                 @Query('loadEagerRelations', new DefaultValuePipe(true), ParseBoolPipe) loadEagerRelations?: boolean,
                 @Query('transaction', new DefaultValuePipe(false), ParseBoolPipe) transaction?: boolean,
                 @Query('comment') comment?: string) {

            const query = qs.parse(request.url.split('?')[1], QS_OPTIONS)
            return this.service.getQuery({...query, skip, take, withDeleted, loadEagerRelations, transaction});
        }

        @Get('count')
        @ApiOperation({summary: `Get count of ${entity.name}s`, operationId: `getCount${entity.name}`})
        @ApiOkResponse({type: Number, description: 'Total count of entities'})
        @ApiQuery({name: 'withDeleted', required: false, type: Boolean, description: 'Include soft deleted records'})
        @ApiQuery({name: 'transaction', required: false, type: Boolean, description: 'Use transaction'})
        @ApiQuery({name: 'comment', required: false, type: String, description: 'Query comment'})
        getCount(@Req() request: FastifyRequest,
                 @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
                 @Query('transaction', new DefaultValuePipe(false), ParseBoolPipe) transaction?: boolean,
                 @Query('comment') comment?: string) {

            const query = qs.parse(request.url.split('?')[1], QS_OPTIONS)
            // Remove pagination parameters for count
            const { skip, take, loadEagerRelations, ...countQuery } = query;
            return this.service.count({...countQuery, withDeleted, transaction});
        }

        // Add the count method to satisfy the interface
        async count(query?: any): Promise<number> {
            return this.service.count(query);
        }

        @Get(':id')
        @ApiOperation({summary: `Get one ${entity.name}`, operationId: `getOne${entity.name}`})
        @ApiOkResponse({type: entity})
        getOne(@Param('id') id: number) {
            return this.service.getOne(+id);
        }

        @Patch(':id')
        @ApiOperation({summary: `Update one ${entity.name}`, operationId: `updateOne${entity.name}`})
        @ApiBody({type: entity})
        update(@Param('id') id: number, @Body() entity: DeepPartial<T>) {
            return this.service.update(+id, entity);
        }

        @Delete(':id')
        @ApiOperation({summary: `Delete one ${entity.name}`, operationId: `deleteOne${entity.name}`})
        delete(@Param('id') id: number) {
            return this.service.delete(+id);
        }

        // File Upload (FastifyMultipart)
        @Post('upload')
        @ApiOperation({summary: `Upload a file for ${entity.name}`, operationId: `upload${entity.name}`})
        @ApiConsumes('multipart/form-data')
        async uploadFile(@Req() request: FastifyRequest) {
            const data = await (request as any).file(); // FastifyMultipart handles this
            const uploadDir = path.join(__dirname, '..', 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {recursive: true});
            }

            const filePath = path.join(uploadDir, data.filename);
            const writeStream = fs.createWriteStream(filePath);
            await data.toBuffer().then((buffer: any) => writeStream.write(buffer));
            writeStream.end();

            return {message: 'File uploaded successfully', filename: data.filename};
        }

        // File Download (Fastify Static)
        @Get('download/:filename')
        @ApiOperation({summary: `Download file related to ${entity.name}`, operationId: `download${entity.name}`})
        async downloadFile(@Param('filename') filename: string, @Res() response: FastifyReply) {
            const filePath = path.join(__dirname, '..', 'uploads', filename);

            if (!fs.existsSync(filePath)) {
                return response.status(404).send({message: 'File not found'});
            }

            response.header('Content-Disposition', `attachment; filename=${filename}`);
            response.send(fs.createReadStream(filePath));
        }
        }

    return crudController
}
