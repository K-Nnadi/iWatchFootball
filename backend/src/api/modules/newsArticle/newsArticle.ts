import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('news_article')
@SecurityFeature<NewsArticle>({
  base: {
    // READ operations - Public access for news articles (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<NewsArticle> => {
        // All users (including unauthenticated) can see all news articles
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'title', 'summary', 'url', 'imageUrl', 
        'source', 'publishedAt', 'category', 'author', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<NewsArticle> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'title', 'summary', 'url', 'imageUrl', 
        'source', 'publishedAt', 'category', 'author', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<NewsArticle> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create news articles (or automated service)
      fields: ['title', 'summary', 'url', 'imageUrl', 'source', 'publishedAt', 'category', 'author', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<NewsArticle> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update news articles
      fields: ['title', 'summary', 'url', 'imageUrl', 'source', 'publishedAt', 'category', 'author', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<NewsArticle> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete news articles
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<NewsArticle> => ({ id: -1 }) },
  },
})
export class NewsArticle extends BaseDbEntity {
    @EntityColumn({
        db: { type: 'varchar', length: 500 },
        api: { description: 'Title of the news article', example: 'How Thomas Tuchel plans to turn England headache into World Cup advantage' },
    })
    title!: string;

    @EntityColumn({
        db: { type: 'text' },
        api: { description: 'Summary or excerpt of the article', example: 'The German manager has been analyzing...' },
    })
    summary!: string;

    @EntityColumn({
        db: { type: 'varchar', length: 1000, unique: true },
        api: { description: 'URL to the original source article', example: 'https://www.independent.co.uk/sport/football/...' },
    })
    url!: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 1000 },
        api: { description: 'URL to the article image', example: 'https://images.unsplash.com/photo-...' },
    })
    imageUrl?: string;

    @EntityColumn({
        db: { type: 'varchar', length: 200 },
        api: { description: 'Source/publication name', example: 'The Independent' },
    })
    source!: string;

    @EntityColumn({
        db: { type: 'timestamp' },
        api: { description: 'Original publication date', example: '2025-01-24T10:00:00Z' },
    })
    publishedAt!: Date;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 100 },
        api: { description: 'Article category/topic', example: 'Premier League' },
    })
    category?: string;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 200 },
        api: { description: 'Author name', example: 'John Smith' },
    })
    author?: string;
}

export class CreateNewsArticleDTO extends PickType(NewsArticle, [
    'title',
    'summary',
    'url',
    'imageUrl',
    'source',
    'publishedAt',
    'category',
    'author',
    'metadata'
] as const) {}

