import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTransferDTO, Transfer} from "./transfer.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class TransferService extends CrudRepoAdapter<Transfer, CreateTransferDTO> {
  constructor(@InjectRepository(Transfer) private entityRepo: Repository<Transfer>) {
    super(entityRepo);
  }
}

@AuthedController('transfer')
export class TransferController extends CrudController<Transfer, CreateTransferDTO>(Transfer, CreateTransferDTO){
  constructor(private service: TransferService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Transfer])],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService]
})


export class TransferModule {}
