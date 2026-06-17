import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { SecurityQuestion } from '../../enums/securityQuestion.enum';
import { UserSecurityAnswer } from './userSecurityAnswer.entity';

export function normalizeSecurityAnswer(answer: string): string {
    return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

@Injectable()
export class UserSecurityAnswerService {
    constructor(
        @InjectRepository(UserSecurityAnswer)
        private readonly repo: Repository<UserSecurityAnswer>,
    ) {}

    async createForUser(userId: number, question: SecurityQuestion, plainAnswer: string): Promise<UserSecurityAnswer> {
        const normalized = normalizeSecurityAnswer(plainAnswer);
        if (normalized.length < 2) {
            throw new Error('Security answer must be at least 2 characters');
        }

        const answerHash = await hash(normalized, parseInt(process.env.SALT_ROUNDS || '10', 10));
        const row = this.repo.create({ userId, question, answerHash });
        return this.repo.save(row);
    }

    async findByUserId(userId: number): Promise<UserSecurityAnswer | null> {
        return this.repo.findOne({ where: { userId } });
    }

    async verifyForUser(userId: number, plainAnswer: string): Promise<boolean> {
        const row = await this.findByUserId(userId);
        if (!row) return false;
        return compare(normalizeSecurityAnswer(plainAnswer), row.answerHash);
    }
}
