import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAdPreference } from './userAdPreference.entity';

export interface UpdateAdPreferenceDto {
    showGamblingContent?: boolean;
}

export interface AdPreferenceResponseDto {
    userId: number;
    showGamblingContent: boolean;
    consentGivenAt?: Date;
    selfExcluded: boolean;
}

@Injectable()
export class UserAdPreferenceService {
    constructor(
        @InjectRepository(UserAdPreference)
        private readonly repo: Repository<UserAdPreference>,
    ) {}

    async getOrCreate(userId: number): Promise<UserAdPreference> {
        let pref = await this.repo.findOne({ where: { userId } });
        if (!pref) {
            pref = await this.repo.save(
                this.repo.create({ userId, showGamblingContent: false, selfExcluded: false }),
            );
        }
        return pref;
    }

    async update(userId: number, dto: UpdateAdPreferenceDto): Promise<AdPreferenceResponseDto> {
        const pref = await this.getOrCreate(userId);

        if (dto.showGamblingContent !== undefined) {
            pref.showGamblingContent = dto.showGamblingContent;
            if (dto.showGamblingContent && !pref.consentGivenAt) {
                pref.consentGivenAt = new Date();
            }
        }

        const saved = await this.repo.save(pref);
        return this.toDto(saved);
    }

    async get(userId: number): Promise<AdPreferenceResponseDto> {
        const pref = await this.getOrCreate(userId);
        return this.toDto(pref);
    }

    /** Admin-only: apply self-exclusion for a user. */
    async selfExclude(userId: number): Promise<void> {
        const pref = await this.getOrCreate(userId);
        pref.selfExcluded = true;
        pref.selfExcludedAt = new Date();
        pref.showGamblingContent = false;
        pref.consentGivenAt = undefined;
        await this.repo.save(pref);
    }

    private toDto(pref: UserAdPreference): AdPreferenceResponseDto {
        return {
            userId: pref.userId,
            showGamblingContent: pref.showGamblingContent,
            consentGivenAt: pref.consentGivenAt,
            selfExcluded: pref.selfExcluded,
        };
    }
}
