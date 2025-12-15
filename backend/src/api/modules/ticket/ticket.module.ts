import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTicketDTO, Ticket} from "./ticket.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class TicketService extends CrudRepoAdapter<Ticket, CreateTicketDTO> {
    constructor(@InjectRepository(Ticket) private entityRepo: Repository<Ticket>) {
        super(entityRepo);
    }
}

@AuthedController('ticket')
export class TicketController extends CrudController<Ticket, CreateTicketDTO>(Ticket, CreateTicketDTO) {
    constructor(private service: TicketService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Ticket])],
    controllers: [TicketController],
    providers: [TicketService],
    exports: [TicketService]
})


export class TicketModule {
}
