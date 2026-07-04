import { Injectable } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { MARKETPLACE_FEES_CONFIG, MARKETPLACE_FEES_DEFAULTS } from './marketplace-fees.constants';

export interface FeeBreakdown {
    ticketPrice: number;
    buyerFee: number;
    total: number;
}

export interface SellerPayoutEstimate {
    grossAmount: number;
    platformFee: number;
    netPayout: number;
}

@Injectable()
export class FeeService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async getBuyerFeeRate(): Promise<number> {
        return this.platformConfig.getNumber(
            MARKETPLACE_FEES_CONFIG.BUYER_FEE_RATE,
            MARKETPLACE_FEES_DEFAULTS.BUYER_FEE_RATE,
        );
    }

    async getSellerFeeRate(): Promise<number> {
        return this.platformConfig.getNumber(
            MARKETPLACE_FEES_CONFIG.SELLER_FEE_RATE,
            MARKETPLACE_FEES_DEFAULTS.SELLER_FEE_RATE,
        );
    }

    async calculateBuyerTotal(ticketPriceGbp: number): Promise<FeeBreakdown> {
        const rate = await this.getBuyerFeeRate();
        const buyerFee = Math.round(ticketPriceGbp * rate * 100) / 100;
        return {
            ticketPrice: ticketPriceGbp,
            buyerFee,
            total: ticketPriceGbp + buyerFee,
        };
    }

    async calculateSellerPayout(ticketPriceGbp: number): Promise<SellerPayoutEstimate> {
        const rate = await this.getSellerFeeRate();
        const platformFee = Math.round(ticketPriceGbp * rate * 100) / 100;
        return {
            grossAmount: ticketPriceGbp,
            platformFee,
            netPayout: ticketPriceGbp - platformFee,
        };
    }

    /** Snapshot current fee rates — must be called at time of purchase and stored on the transaction. */
    async snapshotRates(): Promise<{ buyerFeeRate: number; sellerFeeRate: number }> {
        const [buyerFeeRate, sellerFeeRate] = await Promise.all([
            this.getBuyerFeeRate(),
            this.getSellerFeeRate(),
        ]);
        return { buyerFeeRate, sellerFeeRate };
    }
}
