import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateLogDTO, Log} from "./log.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class LogService extends CrudRepoAdapter<Log, CreateLogDTO> {
    constructor(@InjectRepository(Log) private entityRepo: Repository<Log>) {
        super(entityRepo);
    }
}

@AuthedController('log')
export class LogController extends CrudController<Log, CreateLogDTO>(Log, CreateLogDTO){
    constructor(private service: LogService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Log])],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService]
})


export class LogModule {}
