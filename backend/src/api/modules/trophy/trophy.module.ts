import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTrophyDto, Trophy} from "./trophy";
import {CrudController} from "@footyTrackr/base-tools/crud/crud.controller";
import {AuthedController} from "@footyTrackr/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@footyTrackr/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
class TrophyService extends CrudRepoAdapter<Trophy, CreateTrophyDto> {
  constructor(@InjectRepository(Trophy) private entityRepo: Repository<Trophy>) {
    super(entityRepo);
  }
}

@AuthedController('trophy')
export class TrophyController extends CrudController<Trophy, CreateTrophyDto>(Trophy, CreateTrophyDto){
  constructor(private service: TrophyService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Trophy])],
  controllers: [TrophyController],
  providers: [TrophyService]
})


export class TrophyModule {}
