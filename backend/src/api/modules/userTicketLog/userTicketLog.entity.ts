import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Ticket } from '../ticket/ticket.entity';
import {
    EntityColumn,
    EntityRelation,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('userTicketLog')
export class UserTicketLog extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Owner user id' })
    userId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Ticket id' })
    ticketId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Ticket,
        joinOptions: { name: 'ticketId' },
        description: 'Ticket details',
    })
    ticket!: Ticket;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({
        description:
            'Whether the ticket is currently in the user\'s wallet. False when listed for sale.',
    })
    active!: boolean;
}
