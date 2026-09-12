import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRating } from './userRating.entity';
import { CreateRatingDto, UserTrustSummaryDto } from './userRating.dto';
import { RatingRole } from '../../enums/rating.enum';

/** 7-day window after transfer confirmation; ratings close after that. */
const RATING_WINDOW_DAYS = 7;

@Injectable()
export class UserRatingService {
    constructor(
        @InjectRepository(UserRating)
        private readonly repo: Repository<UserRating>,
    ) {}

    async getMyRatingForListing(listingId: number, raterUserId: number): Promise<UserRating | null> {
        return this.repo.findOne({ where: { listingId, raterUserId } });
    }

    async submitRating(raterUserId: number, dto: CreateRatingDto): Promise<UserRating> {
        const existing = await this.repo.findOne({
            where: { listingId: dto.listingId, raterUserId },
        });
        if (existing) throw new BadRequestException('You have already rated this transaction');

        const rating = this.repo.create({
            listingId: dto.listingId,
            raterUserId,
            targetUserId: dto.targetUserId,
            raterRole: dto.raterRole,
            score: dto.score,
            comment: dto.comment,
        });
        return this.repo.save(rating);
    }

    async getTrustSummary(userId: number): Promise<UserTrustSummaryDto> {
        const result = await this.repo
            .createQueryBuilder('r')
            .select('AVG(r.score)', 'avgScore')
            .addSelect('COUNT(r.id)', 'count')
            .where('r.targetUserId = :userId', { userId })
            .getRawOne<{ avgScore: string | null; count: string }>();

        const avgScore = result?.avgScore != null ? parseFloat(result.avgScore) : 0;
        const count = parseInt(result?.count ?? '0', 10);

        return {
            userId,
            averageRating: count > 0 ? Math.round(avgScore * 10) / 10 : 0,
            totalTransactions: count,
            trustScore: this.computeTrustScore(avgScore, count),
        };
    }

    private computeTrustScore(avgRating: number, count: number): number {
        if (count === 0) return 50;
        const ratingComponent = (avgRating / 5) * 70;
        const volumeComponent = Math.min(count / 10, 1) * 20;
        const baseComponent = 10;
        return Math.round(ratingComponent + volumeComponent + baseComponent);
    }
}
