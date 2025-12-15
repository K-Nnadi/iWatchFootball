import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateFixtureDTO, Fixture} from "./fixture.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class FixtureService extends CrudRepoAdapter<Fixture, CreateFixtureDTO> {
  constructor(@InjectRepository(Fixture) private entityRepo: Repository<Fixture>) {
    super(entityRepo);
  }
}

@AuthedController('fixture')
export class FixtureController extends CrudController<Fixture, CreateFixtureDTO>(Fixture, CreateFixtureDTO){
  constructor(private service: FixtureService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Fixture])],
  controllers: [FixtureController],
  providers: [FixtureService],
  exports: [FixtureService]
})


export class FixtureModule {}
