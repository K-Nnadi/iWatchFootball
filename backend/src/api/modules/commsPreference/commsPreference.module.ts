import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CommsPreferenceDTO, CommsPreference} from "./commsPreference";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CommsPreferenceService extends CrudRepoAdapter<CommsPreference, CommsPreferenceDTO> {
  constructor(@InjectRepository(CommsPreference) private entityRepo: Repository<CommsPreference>) {
    super(entityRepo);
  }
}

@AuthedController('comms-preference')
export class CommsPreferenceController extends CrudController<CommsPreference, CommsPreferenceDTO>(CommsPreference, CommsPreferenceDTO){
  constructor(private service: CommsPreferenceService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([CommsPreference])],
  controllers: [CommsPreferenceController],
  providers: [CommsPreferenceService],
  exports: [CommsPreferenceService]
})


export class CommsPreferenceModule {}
