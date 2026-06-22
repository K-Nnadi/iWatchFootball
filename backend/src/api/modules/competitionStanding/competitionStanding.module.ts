import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateCompetitionStandingDTO, CompetitionStanding} from "./competitionStanding.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CompetitionStandingService extends CrudRepoAdapter<CompetitionStanding, CreateCompetitionStandingDTO> {
    constructor(@InjectRepository(CompetitionStanding) private entityRepo: Repository<CompetitionStanding>) {
        super(entityRepo);
    }

    /** One standing row per teamCompetitionSeason; merge duplicates if they exist. */
    async upsertByTeamCompetitionSeasonId(
        teamCompetitionSeasonId: number,
        payload: CreateCompetitionStandingDTO,
    ): Promise<CompetitionStanding> {
        const rows = await this.getQuery({ where: { teamCompetitionSeasonId } as any });
        if (!rows.length) {
            return this.create(payload);
        }

        const sorted = [...rows].sort((a, b) => {
            const aForm = a.form?.trim() ? 1 : 0;
            const bForm = b.form?.trim() ? 1 : 0;
            if (bForm !== aForm) return bForm - aForm;
            return b.id - a.id;
        });
        const primary = sorted[0];
        const mergedForm = payload.form?.trim() || primary.form?.trim() || undefined;
        const updated = await this.update(primary.id, {
            ...payload,
            id: primary.id,
            ...(mergedForm ? { form: mergedForm } : {}),
        } as any);

        for (const extra of sorted.slice(1)) {
            await this.delete(extra.id);
        }

        return (updated ?? primary) as CompetitionStanding;
    }
}

@AuthedController('competitionStanding')
export class CompetitionStandingController extends CrudController<CompetitionStanding, CreateCompetitionStandingDTO>(CompetitionStanding, CreateCompetitionStandingDTO){
    constructor(private service: CompetitionStandingService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([CompetitionStanding])],
    controllers: [CompetitionStandingController],
    providers: [CompetitionStandingService],
    exports: [CompetitionStandingService]
})


export class CompetitionStandingModule {}
