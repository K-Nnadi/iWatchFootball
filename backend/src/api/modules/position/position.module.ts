import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePositionDTO, Position} from "./position.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class PositionService extends CrudRepoAdapter<Position, CreatePositionDTO> {
    constructor(@InjectRepository(Position) private entityRepo: Repository<Position>) {
        super(entityRepo);
    }
}

@AuthedController('position')
export class PositionController extends CrudController<Position, CreatePositionDTO>(Position, CreatePositionDTO) {
    constructor(private service: PositionService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Position])],
    controllers: [PositionController],
    providers: [PositionService],
    exports: [PositionService]
})


export class PositionModule {
}
