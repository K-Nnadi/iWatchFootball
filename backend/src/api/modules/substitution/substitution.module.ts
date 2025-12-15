import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateSubstitutionDTO, Substitution} from "./substitution.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class SubstitutionService extends CrudRepoAdapter<Substitution, CreateSubstitutionDTO> {
    constructor(@InjectRepository(Substitution) private entityRepo: Repository<Substitution>) {
        super(entityRepo);
    }
}

@AuthedController('substitution')
export class SubstitutionController extends CrudController<Substitution, CreateSubstitutionDTO>(Substitution, CreateSubstitutionDTO) {
    constructor(private service: SubstitutionService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Substitution])],
    controllers: [SubstitutionController],
    providers: [SubstitutionService],
    exports: [SubstitutionService]
})


export class SubstitutionModule {
}
