import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateCardDTO, Card} from "./card.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CardService extends CrudRepoAdapter<Card, CreateCardDTO> {
    constructor(@InjectRepository(Card) private entityRepo: Repository<Card>) {
        super(entityRepo);
    }
}

@AuthedController('card')
export class CardController extends CrudController<Card, CreateCardDTO>(Card, CreateCardDTO) {
    constructor(private service: CardService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Card])],
    controllers: [CardController],
    providers: [CardService],
    exports: [CardService]
})


export class CardModule {
}
