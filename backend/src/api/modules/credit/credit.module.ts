import { Injectable, Module, UnauthorizedException, Scope, Inject } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { CreateCreditDTO, Credit } from './credit.entity';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { Repository } from 'typeorm';

type AuthedRequest = FastifyRequest & { user?: { id: number } };

/** Request-scoped so getAll can read JWT user and never return everyone’s balances. */
@Injectable({ scope: Scope.REQUEST })
export class CreditService extends CrudRepoAdapter<Credit, CreateCreditDTO> {
    constructor(
        @InjectRepository(Credit) entityRepo: Repository<Credit>,
        @Inject(REQUEST) private readonly req: AuthedRequest,
    ) {
        super(entityRepo);
    }

    /**
     * Replaces crude `repository.find()` for GET /credit.
     * Unscoped access meant the UI summed *all users’* balances; checkout correctly debited only JWT user → mismatch.
     */
    async getAll(): Promise<Credit[]> {
        const userId = this.req.user?.id;
        if (userId == null) {
            throw new UnauthorizedException();
        }
        return this.getQuery({ where: { userId } });
    }
}

@AuthedController('credit')
export class CreditController extends CrudController<Credit, CreateCreditDTO>(Credit, CreateCreditDTO) {
    constructor(private service: CreditService) {
        super(service);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Credit])],
    controllers: [CreditController],
    providers: [CreditService],
    exports: [CreditService],
})
export class CreditModule {}
