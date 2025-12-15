import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateAddressDTO, Address} from "./address.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import {Stadium} from "../stadium/stadium.entity";


@Injectable()
export class AddressService extends CrudRepoAdapter<Address, CreateAddressDTO> {
  constructor(@InjectRepository(Address) private entityRepo: Repository<Address>) {
    super(entityRepo);
  }
}

@AuthedController('address')
export class AddressController extends CrudController<Address, CreateAddressDTO>(Address, CreateAddressDTO){
  constructor(private service: AddressService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Address, Stadium])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService]
})


export class AddressModule {}
