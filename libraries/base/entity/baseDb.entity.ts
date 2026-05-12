import {
	BaseEntity as BaseTypeOrmEntity,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	Column, Entity,
} from "typeorm";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import type { EntityMetadata } from "./entityMetadata";

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
		description:
			'Extensible JSON. Multiple external APIs: nest each under `providers.<slug>` (e.g. apisports, statsbomb) with `externalId` where applicable; merge per slug, not the whole object. Legacy top-level vendor fields may exist on older rows.',
		nullable: true,
		example: {
			source: 'import',
			providers: {
				apisports: { externalId: '42', lastImportedAt: '2024-08-01T12:00:00.000Z' },
				statsbomb: { externalId: '12345' },
			},
			tags: ['premier-league', '2024'],
		},
	})
	metadata?: EntityMetadata | null;
}
