import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliatePartner } from './affiliatePartner.entity';
import {
    AffiliatePartnerResponseDto,
    CreateAffiliatePartnerDto,
    UpdateAffiliatePartnerDto,
} from './affiliatePartner.dto';

@Injectable()
export class AffiliatePartnerService {
    constructor(
        @InjectRepository(AffiliatePartner)
        private readonly repo: Repository<AffiliatePartner>,
    ) {}

    async create(dto: CreateAffiliatePartnerDto): Promise<AffiliatePartnerResponseDto> {
        const partner = this.repo.create(dto);
        return this.toDto(await this.repo.save(partner));
    }

    async findAll(): Promise<AffiliatePartnerResponseDto[]> {
        const partners = await this.repo.find({ order: { name: 'ASC' } });
        return partners.map((p) => this.toDto(p));
    }

    async findOne(id: number): Promise<AffiliatePartnerResponseDto> {
        const partner = await this.repo.findOne({ where: { id } });
        if (!partner) throw new NotFoundException('Affiliate partner not found');
        return this.toDto(partner);
    }

    async update(id: number, dto: UpdateAffiliatePartnerDto): Promise<AffiliatePartnerResponseDto> {
        const partner = await this.repo.findOne({ where: { id } });
        if (!partner) throw new NotFoundException('Affiliate partner not found');
        Object.assign(partner, dto);
        return this.toDto(await this.repo.save(partner));
    }

    async remove(id: number): Promise<void> {
        const partner = await this.repo.findOne({ where: { id } });
        if (!partner) throw new NotFoundException('Affiliate partner not found');
        await this.repo.softDelete(id);
    }

    private toDto(p: AffiliatePartner): AffiliatePartnerResponseDto {
        return {
            id: p.id,
            name: p.name,
            partnerType: p.partnerType,
            network: p.network,
            defaultAffiliateTag: p.defaultAffiliateTag,
            affiliateUrlFormat: p.affiliateUrlFormat,
            commissionRatePercent: p.commissionRatePercent != null ? Number(p.commissionRatePercent) : undefined,
            isActive: p.isActive,
            campaignStartDate: p.campaignStartDate,
            campaignEndDate: p.campaignEndDate,
            notes: p.notes,
            minimumAge: p.minimumAge,
            allowedCountries: p.allowedCountries,
            blockedCountries: p.blockedCountries,
            requiresUserConsent: p.requiresUserConsent,
            requiresRGMessage: p.requiresRGMessage,
            disclosureText: p.disclosureText,
            allowedPlacements: p.allowedPlacements,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
