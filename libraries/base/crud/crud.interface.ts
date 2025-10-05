import {DeepPartial, DeleteResult} from 'typeorm';
import {FindManyOptions} from "typeorm/find-options/FindManyOptions";

export interface CrudInterface<T, U> {
	create(entity: U): Promise<T | null>

	getAll(): Promise<T[]>

	getQuery(query: FindManyOptions<T>): Promise<T[]>;

	getOne(id: number): Promise<T | null>

	update(id: number, body: DeepPartial<T>): Promise<DeepPartial<T> | null>

	delete(id: number): Promise<DeleteResult | null>

	count(query?: FindManyOptions<T>): Promise<number>
}
