import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePlayerDTO, Player} from "./player.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class PlayerService extends CrudRepoAdapter<Player, CreatePlayerDTO> {
    constructor(@InjectRepository(Player) private entityRepo: Repository<Player>) {
        super(entityRepo);
    }
}

@AuthedController('player')
export class PlayerController extends CrudController<Player, CreatePlayerDTO>(Player, CreatePlayerDTO){
    constructor(private service: PlayerService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Player])],
    controllers: [PlayerController],
    providers: [PlayerService],
    exports: [PlayerService]
})


export class PlayerModule {}
