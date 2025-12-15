import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTrophyDTO, Trophy} from "./trophy.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class TrophyService extends CrudRepoAdapter<Trophy, CreateTrophyDTO> {
  constructor(@InjectRepository(Trophy) private entityRepo: Repository<Trophy>) {
    super(entityRepo);
  }
}

@AuthedController('trophy')
export class TrophyController extends CrudController<Trophy, CreateTrophyDTO>(Trophy, CreateTrophyDTO){
  constructor(private service: TrophyService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Trophy])],
  controllers: [TrophyController],
  providers: [TrophyService],
  exports: [TrophyService]
})


export class TrophyModule {}
