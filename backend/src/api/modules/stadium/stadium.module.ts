import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateStadiumDTO, Stadium} from "./stadium";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import {Address} from "../address/address";


@Injectable()
export class StadiumService extends CrudRepoAdapter<Stadium, CreateStadiumDTO> {
  constructor(@InjectRepository(Stadium) private entityRepo: Repository<Stadium>) {
    super(entityRepo);
  }
}

@AuthedController('stadium')
export class StadiumController extends CrudController<Stadium, CreateStadiumDTO>(Stadium, CreateStadiumDTO){
  constructor(private service: StadiumService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Stadium, Address])],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService]
})


export class StadiumModule {}
