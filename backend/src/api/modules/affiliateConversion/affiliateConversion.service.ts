import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateConversion } from './affiliateConversion.entity';

export interface PostbackPayload {
    ticketLinkId: number;
    network: string;
    orderId?: string;
    commissionAmount?: number;
    currency?: string;
    userId?: number;
    raw?: Record<string, unknown>;
}

@Injectable()
export class AffiliateConversionService {
    private readonly logger = new Logger(AffiliateConversionService.name);

    constructor(
        @InjectRepository(AffiliateConversion)
        private readonly repo: Repository<AffiliateConversion>,
    ) {}

    async record(payload: PostbackPayload): Promise<AffiliateConversion> {
        const conversion = this.repo.create({
            ticketLinkId: payload.ticketLinkId,
            network: payload.network,
            orderId: payload.orderId,
            commissionAmount: payload.commissionAmount,
            currency: payload.currency,
            userId: payload.userId,
            rawPayload: payload.raw,
        });
        const saved = await this.repo.save(conversion);
        this.logger.log(
            `Affiliate conversion recorded: id=${saved.id} ticketLinkId=${payload.ticketLinkId} network=${payload.network} orderId=${payload.orderId}`,
        );
        return saved;
    }

    async listRecent(limit = 100): Promise<AffiliateConversion[]> {
        return this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
    }
}
