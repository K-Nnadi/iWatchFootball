import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateRefereeDTO, Referee} from "./referee.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class RefereeService extends CrudRepoAdapter<Referee, CreateRefereeDTO> {
    constructor(@InjectRepository(Referee) private entityRepo: Repository<Referee>) {
        super(entityRepo);
    }
}

@AuthedController('referee')
export class RefereeController extends CrudController<Referee, CreateRefereeDTO>(Referee, CreateRefereeDTO) {
    constructor(private service: RefereeService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Referee])],
    controllers: [RefereeController],
    providers: [RefereeService],
    exports: [RefereeService]
})


export class RefereeModule {
}
