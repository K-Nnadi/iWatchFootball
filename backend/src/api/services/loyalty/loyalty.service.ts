import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from '../../modules/transaction/transaction';
import {TransactionType} from '../../enums/transaction.enum';
import {Credit} from '../../modules/credit/credit';
import {LoyaltyScheme} from '../../modules/loyaltyScheme/loyaltyScheme';
import {LoyaltyEvent} from '../../modules/loyaltyEvent/loyaltyEvent';
import {LoyaltyEventType} from '../../enums/loyaltyEventType.enum';
import {User} from '../../modules/user/user';

@Injectable()
export class LoyaltyService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
        @InjectRepository(Credit)
        private creditRepo: Repository<Credit>,
        @InjectRepository(LoyaltyScheme)
        private loyaltySchemeRepo: Repository<LoyaltyScheme>,
        @InjectRepository(LoyaltyEvent)
        private loyaltyEventRepo: Repository<LoyaltyEvent>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    /**
     * Check and process loyalty rewards after a transaction
     * This should be called after a payment transaction is created
     */
    async processLoyaltyRewards(userId: number, transactionAmount: number): Promise<void> {
        // Get user's total spending (only cash payments count)
        const totalSpending = await this.getUserTotalSpending(userId);

        // Check spending milestone rules
        await this.checkSpendingMilestones(userId, totalSpending);

        // Check for first purchase
        await this.checkFirstPurchase(userId);
    }

    /**
     * Check and process birthday rewards
     * This should be called daily via a scheduled job
     * Note: This checks user metadata for birthday. You may need to add a birthday field to User entity
     */
    async processBirthdayRewards(): Promise<void> {
        const today = new Date();
        const month = today.getMonth() + 1; // JavaScript months are 0-indexed
        const day = today.getDate();

        // Get all users and check their metadata for birthday
        // Alternatively, you can add a birthday field to the User entity
        const users = await this.userRepo.find();

        for (const user of users) {
            if (user.metadata?.birthday) {
                const birthday = new Date(user.metadata.birthday);
                if (birthday.getMonth() + 1 === month && birthday.getDate() === day) {
                    await this.awardBirthdayReward(user.id);
                }
            }
        }
    }

    /**
     * Get user's total spending (only cash payments)
     */
    private async getUserTotalSpending(userId: number): Promise<number> {
        const result = await this.transactionRepo
            .createQueryBuilder('transaction')
            .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
            .where('transaction.userId = :userId', { userId })
            .andWhere('transaction.type = :type', { type: TransactionType.CASH_PAYMENT })
            .andWhere('transaction.amount < 0') // Only count payments (negative amounts)
            .getRawOne();

        return parseFloat(result?.total || '0');
    }

    /**
     * Check spending milestone rules and award credits if threshold is reached
     */
    private async checkSpendingMilestones(userId: number, totalSpending: number): Promise<void> {
        // Get all enabled spending milestone schemes
        const schemes = await this.loyaltySchemeRepo.find({
            where: {
                eventType: LoyaltyEventType.SPENDING_MILESTONE,
                enabled: true,
            },
        });

        for (const scheme of schemes) {
            if (!scheme.threshold) continue;

            // Check if user has reached this milestone
            if (totalSpending >= scheme.threshold) {
                // Check if we've already awarded this milestone
                const existingEvent = await this.loyaltyEventRepo.findOne({
                    where: {
                        userId,
                        loyaltySchemeId: scheme.id,
                        eventType: LoyaltyEventType.SPENDING_MILESTONE,
                    },
                });

                if (!existingEvent) {
                    // Award the credit
                    await this.awardCredit(
                        userId,
                        scheme.rewardAmount,
                        LoyaltyEventType.SPENDING_MILESTONE,
                        scheme.id,
                        `Spending milestone reward: £${scheme.rewardAmount} for spending £${scheme.threshold}`,
                    );
                }
            }
        }
    }

    /**
     * Check if this is user's first purchase and award reward if applicable
     */
    private async checkFirstPurchase(userId: number): Promise<void> {
        // Count user's cash payment transactions
        const purchaseCount = await this.transactionRepo.count({
            where: {
                userId,
                type: TransactionType.CASH_PAYMENT,
            },
        });

        // If this is the first purchase
        if (purchaseCount === 1) {
            // Check if we've already awarded first purchase reward
            const existingEvent = await this.loyaltyEventRepo.findOne({
                where: {
                    userId,
                    eventType: LoyaltyEventType.FIRST_PURCHASE,
                },
            });

            if (!existingEvent) {
                // Get first purchase scheme
                const scheme = await this.loyaltySchemeRepo.findOne({
                    where: {
                        eventType: LoyaltyEventType.FIRST_PURCHASE,
                        enabled: true,
                    },
                });

                if (scheme) {
                    await this.awardCredit(
                        userId,
                        scheme.rewardAmount,
                        LoyaltyEventType.FIRST_PURCHASE,
                        scheme.id,
                        `First purchase reward: £${scheme.rewardAmount}`,
                    );
                }
            }
        }
    }

    /**
     * Award birthday reward to a user
     */
    private async awardBirthdayReward(userId: number): Promise<void> {
        // Check if we've already awarded birthday reward this year
        const thisYear = new Date().getFullYear();
        const startOfYear = new Date(thisYear, 0, 1);
        const endOfYear = new Date(thisYear, 11, 31, 23, 59, 59);

        const existingEvent = await this.loyaltyEventRepo
            .createQueryBuilder('event')
            .where('event.userId = :userId', { userId })
            .andWhere('event.eventType = :eventType', { eventType: LoyaltyEventType.BIRTHDAY })
            .andWhere('event.createdAt >= :startOfYear', { startOfYear })
            .andWhere('event.createdAt <= :endOfYear', { endOfYear })
            .getOne();

        if (!existingEvent) {
            // Get birthday scheme
            const scheme = await this.loyaltySchemeRepo.findOne({
                where: {
                    eventType: LoyaltyEventType.BIRTHDAY,
                    enabled: true,
                },
            });

            if (scheme) {
                await this.awardCredit(
                    userId,
                    scheme.rewardAmount,
                    LoyaltyEventType.BIRTHDAY,
                    scheme.id,
                    `Birthday reward: £${scheme.rewardAmount}`,
                );
            }
        }
    }

    /**
     * Award credit to a user and create a loyalty event record
     */
    private async awardCredit(
        userId: number,
        amount: number,
        eventType: LoyaltyEventType,
        schemeId?: number,
        description?: string,
    ): Promise<void> {
        // Get or create user's credit account
        let credit = await this.creditRepo.findOne({
            where: { userId },
        });

        if (!credit) {
            credit = this.creditRepo.create({
                userId,
                balance: 0,
            });
            await this.creditRepo.save(credit);
        }

        // Add credit to balance
        credit.balance = parseFloat((credit.balance + amount).toFixed(2));
        await this.creditRepo.save(credit);

        // Create transaction for the credit award
        const transaction = this.transactionRepo.create({
            userId,
            type: TransactionType.CREDIT_TOP_UP,
            amount: amount,
            description: description || `Loyalty reward: ${eventType}`,
        });
        await this.transactionRepo.save(transaction);

        // Create loyalty event record
        const loyaltyEvent = this.loyaltyEventRepo.create({
            userId,
            eventType,
            loyaltySchemeId: schemeId,
            rewardAmount: amount,
            description,
        });
        await this.loyaltyEventRepo.save(loyaltyEvent);
    }
}

