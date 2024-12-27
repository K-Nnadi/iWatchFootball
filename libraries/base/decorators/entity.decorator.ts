import { applyDecorators } from '@nestjs/common';
import { Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColumnOptions } from 'typeorm/decorator/options/ColumnOptions';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';

interface EntityDecorator {
	db?: ColumnOptions;
	api?: ApiPropertyOptions;
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
