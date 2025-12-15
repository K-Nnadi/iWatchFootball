import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateInjuryDTO, Injury} from "./injury.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class InjuryService extends CrudRepoAdapter<Injury, CreateInjuryDTO> {
  constructor(@InjectRepository(Injury) private entityRepo: Repository<Injury>) {
    super(entityRepo);
  }
}

@AuthedController('injury')
export class InjuryController extends CrudController<Injury, CreateInjuryDTO>(Injury, CreateInjuryDTO){
  constructor(private service: InjuryService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Injury])],
  controllers: [InjuryController],
  providers: [InjuryService],
  exports: [InjuryService]
})


export class InjuryModule {}
