import {
	ArrayContains,
	Between,
	DeepPartial,
	DeleteResult, FindOptionsRelations,
	FindOptionsWhere,
	ILike,
	In,
	LessThan,
	LessThanOrEqual,
	MoreThan,
	MoreThanOrEqual,
	Not,
	ObjectLiteral,
	Raw,
	Repository
} from 'typeorm';
import type { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import type { CrudInterface } from './crud.interface';
import { Logger } from '@nestjs/common';
import { recurseWithAsyncValueFunction, recurseWithObjFunction } from '../helpers';
import { QueryOptions } from './crud.controller';

export class CrudRepoAdapter<T extends ObjectLiteral & { id: number }, U extends ObjectLiteral> implements CrudInterface<T, U> {

	keys = ['$gte', '$lte', '$btwn', '$gt', '$lt', '$not', '$in', '$like', '$raw', '$contains'];
	private logger = new Logger(CrudRepoAdapter.name);

	constructor(private repository: Repository<T>) {}

	private shouldLogCrud(): boolean {
		return process.env.LOG_CRUD !== 'false';
	}

	private logCrud(message: string): void {
		if (this.shouldLogCrud()) {
			this.logger.log(message);
		}
	}

	async getAll(): Promise<T[]> {
		this.logCrud(`getAll - ${this.repository.metadata.name}`)
		return this.repository.find();
	}

	async getQuery(query: FindManyOptions<T>): Promise<T[]> {
		this.logCrud(`getQuery - ${this.repository.metadata.name} - ${JSON.stringify(query)}`)
		const finalQuery = await this.parseQueryOptions(query)
		return this.repository.find(finalQuery);
	}

	async getOne(findId: number): Promise<T | null> {
		this.logCrud(`getOne - ${this.repository.metadata.name} - ${findId}`)
		return this.repository.findOneBy({id: findId.toString()} as unknown as FindOptionsWhere<T>);
	}

	async create(entity: U): Promise<any | null> {
		this.logCrud(`create - ${this.repository.metadata.name} - ${JSON.stringify(entity)}`)
		// Plain objects often omit FK scalars when columns are shared with relations — hydrate via metadata first.
		const model = this.repository.create(entity as unknown as DeepPartial<T>)
		return await this.repository.save(model)
	}

	async update(id: number, entity: DeepPartial<T>): Promise<DeepPartial<T> | null> {
		this.logCrud(`update - ${this.repository.metadata.name} - ${id} - ${JSON.stringify(entity)}`)
		await this.repository.update({ id } as FindOptionsWhere<T>, entity as any)
		return { id, ...entity } as DeepPartial<T>
	}

	async delete(id: number): Promise<DeleteResult | null> {
		this.logCrud(`delete - ${this.repository.metadata.name} - ${id}`)
		const resp = await this.repository.softDelete(id)
		return resp.raw
	}

	async count(query?: FindManyOptions<T>): Promise<number> {
		this.logCrud(`count - ${this.repository.metadata.name} - ${JSON.stringify(query)}`)
		if (query) {
			const finalQuery = await this.parseQueryOptions(query)
			return this.repository.count(finalQuery);
		}
		return this.repository.count();
	}

	parseQueryOptions = async (query: FindManyOptions<T>): Promise<FindManyOptions<T>> => {
		let parsedRelations: object | FindOptionsRelations<T>;

		if (query.relations) {
			const rel = query.relations as unknown;
			// String arrays must bypass recurse helpers — otherwise each relation string is iterated like an object (chars).
			if (Array.isArray(rel) && rel.every((item) => typeof item === 'string')) {
				parsedRelations = rel as unknown as FindOptionsRelations<T>;
			} else {
				parsedRelations = (await recurseWithAsyncValueFunction(query.relations, async (obj, key, val) => {
					if (val === 'true') {
						return true;
					} else {
						return val;
					}
				})) as FindOptionsRelations<T>;
			}
		} else {
			parsedRelations = {};
		}

		console.log(query.where)

		const parsedWhere = await recurseWithObjFunction(
			query.where,
			(obj: any) => {
				return Object.keys(obj).length === 1 && Object.keys(obj).some((key) => this.keys.includes(key));
			},
			(obj: any) => {
				const specialKey = Object.keys(obj)[0];
				switch (specialKey) {
					case '$gte':
						return MoreThanOrEqual(obj[specialKey]);
					case '$lte':
						return LessThanOrEqual(obj[specialKey]);
					case '$btwn':
						return Between(obj[specialKey][0], obj[specialKey][1]);
					case '$gt':
						return MoreThan(obj[specialKey]);
					case '$lt':
						return LessThan(obj[specialKey]);
					case '$not':
						return Not(obj[specialKey]);
					case '$in':
						return In(obj[specialKey]);
					case '$like':
						return ILike(obj[specialKey]);
					case '$raw':
						return Raw(obj[specialKey]);
					case '$contains':
						return ArrayContains(obj[specialKey]);
					default:
						return obj;
				}
			}
		);

		return {
			...query,
			where: parsedWhere,
			relations: parsedRelations
		};
	};
}
