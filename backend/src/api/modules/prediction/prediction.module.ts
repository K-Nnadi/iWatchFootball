import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePredictionDTO, Prediction} from "./prediction";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class PredictionService extends CrudRepoAdapter<Prediction, CreatePredictionDTO> {
    constructor(@InjectRepository(Prediction) private entityRepo: Repository<Prediction>) {
        super(entityRepo);
    }
}

@AuthedController('prediction')
export class PredictionController extends CrudController<Prediction, CreatePredictionDTO>(Prediction, CreatePredictionDTO) {
    constructor(private service: PredictionService) {
        super(service)
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
