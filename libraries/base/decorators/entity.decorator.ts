import { applyDecorators } from '@nestjs/common';
import {Column, JoinColumn, JoinColumnOptions, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';

interface EntityDecorator {
	db?: ColumnOptions;
	api?: ApiPropertyOptions;
}

// type ToMany = {
// 	type: RelationshipType.ONE_TO_MANY | RelationshipType.MANY_TO_MANY
// 	inverseSide: Function
// }

interface RelationshipOptions {
	type: RelationshipType;
	entity: Function;  // The target entity function reference
	inverseSide?: Function | string;  // Used in one-to-many and many-to-many
	description: string;
	joinOptions?: any;  // Options for JoinColumn or JoinTable
}

export enum RelationshipType {
	ONE_TO_ONE = 'one-to-one',
	ONE_TO_MANY = 'one-to-many',
	MANY_TO_ONE = 'many-to-one',
	MANY_TO_MANY = 'many-to-many'
}

/**
 * Utility decorator for required entity columns
 */
export function EntityColumn(opts?: EntityDecorator): ReturnType<typeof applyDecorators> {
	return applyDecorators(
		Column(opts?.db || {}),
		ApiProperty(opts?.api || {})
	);
}

/**
 * Utility decorator for optional entity columns
 */
export function OptionalEntityColumn(opts?: EntityDecorator): ReturnType<typeof applyDecorators> {
	return applyDecorators(
		Column({ ...opts?.db, nullable: true }),
		ApiPropertyOptional(opts?.api || {})
	);
}

/**
 * Utility decorator for enum entity columns
 */
export function EntityEnumColumn(opts?: EntityDecorator): ReturnType<typeof applyDecorators> {
	return applyDecorators(
		Column({ type: 'enum', ...opts?.db }),
		ApiProperty({ ...opts?.api, enum: opts?.db?.enum })
	);
}


/**
 * Utility decorator for entity relations
 */
export function EntityRelation(options: RelationshipOptions) {
	const { type, entity, inverseSide, description, joinOptions } = options;

	switch (type) {
		case RelationshipType.ONE_TO_ONE:
			return applyDecorators(
				OneToOne(() => entity, { eager: true }),
				JoinColumn(joinOptions),
				ApiProperty({ description, type: () => entity })
			);
		case RelationshipType.ONE_TO_MANY:
			return applyDecorators(
				// @ts-ignore
				OneToMany(() => entity, inverseSide),
				ApiProperty({ description, type: () => [entity] })
			);
		case RelationshipType.MANY_TO_ONE:
			return applyDecorators(
				ManyToOne(() => entity, { lazy: true }),
				JoinColumn(joinOptions),
				ApiProperty({ description, type: () => entity })
			);
		case RelationshipType.MANY_TO_MANY:
			return applyDecorators(
				// @ts-ignore
				ManyToMany(() => entity, inverseSide, { eager: true }),
				JoinTable(joinOptions),
				ApiProperty({ description, type: () => [entity] })
			);
		default:
			throw new Error(`Unsupported relation type: ${type}`);
	}
}