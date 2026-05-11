import { Get, Injectable, Module, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { Repository } from 'typeorm';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { PredictedResult } from '../../enums/prediction.enum';
import { CreatePredictionDTO, Prediction } from './prediction.entity';
import { FixturePredictionTallyDto } from './fixture-prediction-tally.dto';

@Injectable()
export class PredictionService extends CrudRepoAdapter<Prediction, CreatePredictionDTO> {
    constructor(@InjectRepository(Prediction) private entityRepo: Repository<Prediction>) {
        super(entityRepo);
    }

    async getFixturePredictionTally(fixtureId: number): Promise<FixturePredictionTallyDto> {
        const rows = await this.entityRepo
            .createQueryBuilder('p')
            .select('p.predicted', 'predicted')
            .addSelect('COUNT(p.id)', 'cnt')
            .where('p.fixtureId = :fixtureId', { fixtureId })
            .andWhere('p.predicted IS NOT NULL')
            .groupBy('p.predicted')
            .getRawMany<{ predicted: string; cnt: string }>();

        let home = 0;
        let draw = 0;
        let away = 0;
        for (const row of rows) {
            const n = Number(row.cnt);
            switch (row.predicted) {
                case PredictedResult.HOME:
                    home += n;
                    break;
                case PredictedResult.DRAW:
                    draw += n;
                    break;
                case PredictedResult.AWAY:
                    away += n;
                    break;
                default:
                    break;
            }
        }
        const total = home + draw + away;
        return { home, draw, away, total };
    }
}

@ApiTags('prediction')
@AuthedController('prediction')
export class PredictionController extends CrudController<Prediction, CreatePredictionDTO>(Prediction, CreatePredictionDTO) {
    constructor(private service: PredictionService) {
        super(service);
    }

    @Get('fixture/:fixtureId/tally')
    @Public()
    @ApiOperation({ summary: 'Aggregate prediction counts for a fixture (public poll totals)' })
    @ApiOkResponse({ type: FixturePredictionTallyDto })
    async getFixtureTally(@Param('fixtureId', ParseIntPipe) fixtureId: number): Promise<FixturePredictionTallyDto> {
        return this.service.getFixturePredictionTally(fixtureId);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Prediction])],
    controllers: [PredictionController],
    providers: [PredictionService],
    exports: [PredictionService]
})


export class PredictionModule {
}
