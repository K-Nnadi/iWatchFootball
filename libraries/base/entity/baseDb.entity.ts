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
	@ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
	deletedAt!: Date | null

	@Column({ type: 'jsonb', nullable: true })
	@ApiPropertyOptional({
		description: 'Metadata stored as JSON',
		nullable: true,
		example: { source: 'StatsBomb', version: '1.0', tags: ['premier-league', '2024'] },
	})
	metadata?: Record<string, any> | null;
}
