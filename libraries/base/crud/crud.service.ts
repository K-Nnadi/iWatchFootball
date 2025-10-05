import {DeepPartial} from 'typeorm';
import {Body, Param, Type} from '@nestjs/common';
import {CrudInterface} from "./crud.interface";


export interface ServiceInterface<T, U> extends Omit<CrudInterface<T, U>, "getQuery"> {
    // getQuery(request: FastifyRequest, skip?: number, take?: number, withDeleted?: boolean, loadEagerRelations?: boolean, transaction?: boolean, comment?: string, where?: any): Promise<T[]>
}


export const CrudService = <T, U>(entity: any, createDTO: any): Type<CrudInterface<T, U>> => {
    class crudService<T> implements CrudInterface<T, U> {
        constructor(private readonly service: CrudInterface<T, U>) {
        }

        create(@Body() entity: typeof createDTO) {
            return this.service.create(entity);
        }

        getAll() {
            return this.service.getAll();
        }

        getQuery(query: any) {
            return this.service.getQuery(query);
        }

        getOne(@Param('id') id: number) {
            return this.service.getOne(+id);
        }

        update(@Param('id') id: number, @Body() entity: DeepPartial<T>) {
            return this.service.update(+id, entity);
        }

        delete(@Param('id') id: number) {
            return this.service.delete(+id);
        }

        count(query?: any) {
            return this.service.count(query);
        }
    }

    return crudService
}
