import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePlayerLineUpDTO, PlayerLineUp} from "./playerLineUp.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class PlayerLineUpService extends CrudRepoAdapter<PlayerLineUp, CreatePlayerLineUpDTO> {
  constructor(@InjectRepository(PlayerLineUp) private entityRepo: Repository<PlayerLineUp>) {
    super(entityRepo);
  }
}

@AuthedController('playerLineUp')
export class PlayerLineUpController extends CrudController<PlayerLineUp, CreatePlayerLineUpDTO>(PlayerLineUp, CreatePlayerLineUpDTO){
  constructor(private service: PlayerLineUpService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([PlayerLineUp])],
  controllers: [PlayerLineUpController],
  providers: [PlayerLineUpService],
  exports: [PlayerLineUpService]
})


export class PlayerLineUpModule {}
