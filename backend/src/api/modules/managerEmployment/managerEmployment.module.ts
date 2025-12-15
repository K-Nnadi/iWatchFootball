import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateManagerEmploymentDTO, ManagerEmployment} from "./managerEmployment.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class ManagerEmploymentService extends CrudRepoAdapter<ManagerEmployment, CreateManagerEmploymentDTO> {
  constructor(@InjectRepository(ManagerEmployment) private entityRepo: Repository<ManagerEmployment>) {
    super(entityRepo);
  }
}

@AuthedController('managerEmployment')
export class ManagerEmploymentController extends CrudController<ManagerEmployment, CreateManagerEmploymentDTO>(ManagerEmployment, CreateManagerEmploymentDTO){
  constructor(private service: ManagerEmploymentService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([ManagerEmployment])],
  controllers: [ManagerEmploymentController],
  providers: [ManagerEmploymentService],
  exports: [ManagerEmploymentService]
})


export class ManagerEmploymentModule {}
