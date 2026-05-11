import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Credit } from './credit.entity';

/**
 * Reads all credit wallets for this user (defensive against duplicate historical rows).
 * Applies a single debit across rows in deterministic order until the remainder is exhausted.
 */
export async function assertAndDeductCredit(
    creditRepo: Repository<Credit>,
    userId: number,
    amount: number,
): Promise<void> {
    if (!(amount >= 0) || Number.isNaN(amount)) {
        throw new BadRequestException('Invalid debit amount');
    }
    if (amount <= 1e-9) {
        return;
    }
    const accounts = await creditRepo.find({
        where: { userId },
        order: { id: 'ASC' },
    });

    const total = accounts.reduce((s, row) => s + Number(row.balance ?? 0), 0);
    if (total + 1e-9 < amount) {
        throw new BadRequestException(
            `Insufficient credit balance. Available: £${total.toFixed(2)}, required: £${amount.toFixed(2)}`,
        );
    }
    if (accounts.length === 0) {
        throw new BadRequestException('No credit account found');
    }

    let remaining = Math.round(amount * 100) / 100;
    for (const row of accounts) {
        const b = Number(row.balance ?? 0);
        if (b <= 0 || remaining <= 0) {
            continue;
        }
        const take = Math.min(b, remaining);
        row.balance = Math.round((b - take) * 100) / 100;
        await creditRepo.save(row);
        remaining = Math.round((remaining - take) * 100) / 100;
        if (remaining <= 1e-6) {
            return;
        }
    }

    throw new BadRequestException('Insufficient credit balance (could not complete debit)');
}
