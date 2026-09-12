import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateManagerDTO, Manager} from "./manager.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import { ManagerEmployment } from '../managerEmployment/managerEmployment.entity';
import { Team } from '../team/team.entity';
import { Fixture } from '../fixture/fixture.entity';
import { ManagerProfileService } from './manager-profile.service';
import { ManagerProfileController } from './manager-profile.controller';


@Injectable()
export class ManagerService extends CrudRepoAdapter<Manager, CreateManagerDTO> {
  constructor(@InjectRepository(Manager) private entityRepo: Repository<Manager>) {
    super(entityRepo);
  }
}

@AuthedController('manager')
export class ManagerController extends CrudController<Manager, CreateManagerDTO>(Manager, CreateManagerDTO){
  constructor(private service: ManagerService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Manager, ManagerEmployment, Team, Fixture])],
  controllers: [ManagerController, ManagerProfileController],
  providers: [ManagerService, ManagerProfileService],
  exports: [ManagerService, ManagerProfileService]
})


export class ManagerModule {}
