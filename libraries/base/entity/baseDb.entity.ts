import {
	BaseEntity as BaseTypeOrmEntity,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	Column, Entity,
} from "typeorm";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export abstract class BaseDbEntity extends BaseTypeOrmEntity {

	@PrimaryGeneratedColumn()
	@ApiProperty()
	id!: number;

	@CreateDateColumn()
	@ApiPropertyOptional()
	createdAt!: Date

	@UpdateDateColumn()
	@ApiPropertyOptional()
	updatedAt!: Date

	@DeleteDateColumn()
	@ApiPropertyOptional()
	deletedAt!: Date

	@Column({ type: 'jsonb', nullable: true })
	@ApiPropertyOptional({ 
		description: 'Metadata stored as JSON', 
		example: { source: 'StatsBomb', version: '1.0', tags: ['premier-league', '2024'] } 
	})
	metadata?: Record<string, any>;
}
