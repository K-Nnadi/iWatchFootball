import {ApiOkResponse, ApiOperation, ApiProperty} from '@nestjs/swagger';
import {Get, Module, Param} from '@nestjs/common';
import {AuthedController} from '@iWatchFootball/base-tools/decorators/controller.decorator';
import {Fixture} from '../modules/fixture/fixture';
import {LineUp} from '../modules/lineUp/lineUp';
import {Goal} from '../modules/goal/goal';
import {Card} from '../modules/card/card';
import {Substitution} from '../modules/substitution/substitution';
import {FixtureModule, FixtureService} from '../modules/fixture/fixture.module';
import {LineUpModule, LineupService} from '../modules/lineUp/lineUp.module';
import {GoalModule, GoalService} from '../modules/goal/goal.module';
import {CardModule, CardService} from '../modules/card/card.module';
import {SubstitutionModule, SubstitutionService} from '../modules/substitution/substitution.module';


export class MatchDayResponse {
    @ApiProperty({type: Fixture})
    fixture!: Fixture;

    @ApiProperty({type: [LineUp]})
    lineUps!: LineUp[];

    @ApiProperty({type: [Goal]})
    goals!: Goal[];

    @ApiProperty({type: [Card]})
    cards!: Card[];

    @ApiProperty({type: [Substitution]})
    substitutions!: Substitution[];
}

@AuthedController('match-day')
export class MatchDayController {
    constructor(
        private fixtureService: FixtureService,
        private lineUpService: LineupService,
        private goalService: GoalService,
        private cardService: CardService,
        private substitutionService: SubstitutionService,
    ) {
    }

    @Get(':fixtureId/complete')
    @ApiOperation({summary: 'Get complete match day data for a fixture', operationId: 'getCompleteMatchData'})
    @ApiOkResponse({type: MatchDayResponse})
    async getCompleteMatchData(@Param('fixtureId') fixtureId: number): Promise<MatchDayResponse> {
        const [fixture] = await this.fixtureService.getQuery({
            where: {
                id: fixtureId
            },
            relations: ['homeTeam', 'awayTeam', 'stadium']
        });

        const lineUps = await this.lineUpService.getQuery({
            where: {fixtureId},
            relations: ['playerLineUps', 'playerLineUps.player']
        });

        const goals = await this.goalService.getQuery({
            where: {fixtureId},
            relations: ['scorer', 'assist']
        });

        const cards = await this.cardService.getQuery({
            where: {fixtureId},
            relations: ['player']
        });

        const substitutions = await this.substitutionService.getQuery({
            where: {fixtureId},
            relations: ['playerIn', 'playerOut']
        });

        return {
            fixture,
            lineUps,
            goals,
            cards,
            substitutions
        };
    }
}

@Module({
    imports: [
        FixtureModule,
        LineUpModule,
        GoalModule,
        CardModule,
        SubstitutionModule
    ],
    controllers: [MatchDayController],
    providers: [],
    exports: []
})
export class MatchDayModule {
}
