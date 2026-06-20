import { Controller, Get, Injectable, Module, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ApiTags } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CreateFixtureHighlightDTO, FixtureHighlight } from './fixtureHighlight.entity';
import { HighlightStatus } from '../../enums/fixture-highlight.enum';

@Injectable()
export class FixtureHighlightService extends CrudRepoAdapter<FixtureHighlight, CreateFixtureHighlightDTO> {
    constructor(
        @InjectRepository(FixtureHighlight) private entityRepo: Repository<FixtureHighlight>,
    ) {
        super(entityRepo);
    }

    async findActiveByFixtureId(fixtureId: number): Promise<FixtureHighlight[]> {
        return this.entityRepo.find({
            where: { fixtureId, status: HighlightStatus.ACTIVE },
            order: { publishedAt: 'DESC' },
        });
    }

    async upsertByProviderVideoId(data: Partial<FixtureHighlight>): Promise<FixtureHighlight> {
        const existing = await this.entityRepo.findOne({
            where: { providerVideoId: data.providerVideoId, provider: data.provider },
        });
        if (existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await this.entityRepo.update(existing.id, data as any);
            return this.entityRepo.findOne({ where: { id: existing.id } }) as Promise<FixtureHighlight>;
        }
        return this.entityRepo.save(this.entityRepo.create(data));
    }

    async findAllActive(): Promise<FixtureHighlight[]> {
        return this.entityRepo.find({ where: { status: HighlightStatus.ACTIVE } });
    }

    async markAsRemoved(id: number): Promise<void> {
        await this.entityRepo.update(id, { status: HighlightStatus.REMOVED });
    }
}

@AuthedController('fixture-highlight')
export class FixtureHighlightController extends CrudController<FixtureHighlight, CreateFixtureHighlightDTO>(
    FixtureHighlight,
    CreateFixtureHighlightDTO,
) {
    constructor(private service: FixtureHighlightService) {
        super(service);
    }
}

@ApiTags('fixtures')
@Controller('fixtures')
export class FixtureHighlightsController {
    constructor(private readonly fixtureHighlightService: FixtureHighlightService) {}

    @Get(':id/highlights')
    async getFixtureHighlights(
        @Param('id', ParseIntPipe) fixtureId: number,
    ): Promise<FixtureHighlight[]> {
        return this.fixtureHighlightService.findActiveByFixtureId(fixtureId);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([FixtureHighlight])],
    controllers: [FixtureHighlightController, FixtureHighlightsController],
    providers: [FixtureHighlightService],
    exports: [FixtureHighlightService],
})
export class FixtureHighlightModule {}
