import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateStadiumDTO, Stadium} from "./stadium.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import {Address} from "../address/address.entity";
import { TeamStadium } from '../teamStadium/teamStadium.entity';
import { Team } from '../team/team.entity';
import { Fixture } from '../fixture/fixture.entity';
import { StadiumProfileService } from './stadium-profile.service';
import { StadiumProfileController } from './stadium-profile.controller';
import { StadiumWikipediaService } from './stadium-wikipedia.service';


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
  imports: [TypeOrmModule.forFeature([Stadium, Address, TeamStadium, Team, Fixture])],
  controllers: [StadiumController, StadiumProfileController],
  providers: [StadiumService, StadiumProfileService, StadiumWikipediaService],
  exports: [StadiumService, StadiumProfileService]
})


export class StadiumModule {}
