import {Injectable, Module, forwardRef, Inject} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTransactionDTO, Transaction} from "./transaction.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import {TransactionType} from "../../enums/transaction.enum";
import {LoyaltyModule} from "../../services/loyalty/loyalty.module";
import {LoyaltyService} from "../../services/loyalty/loyalty.service";


@Injectable()
export class TransactionService extends CrudRepoAdapter<Transaction, CreateTransactionDTO> {
    constructor(
        @InjectRepository(Transaction) private entityRepo: Repository<Transaction>,
        @Inject(forwardRef(() => LoyaltyService))
        private loyaltyService?: LoyaltyService,
    ) {
        super(entityRepo);
    }

    /**
     * Override create to process loyalty rewards after cash payment transactions
     */
    async create(dto: CreateTransactionDTO): Promise<Transaction> {
        const transaction = await super.create(dto);

        // Process loyalty rewards if this is a cash payment
        if (
            transaction.type === TransactionType.CASH_PAYMENT &&
            Number(transaction.amount) !== 0 &&
            this.loyaltyService
        ) {
            // Use setTimeout to avoid blocking the response
            setImmediate(async () => {
                try {
                    await this.loyaltyService!.processLoyaltyRewards(
                        transaction.userId,
                        Math.abs(transaction.amount),
                    );
                } catch (error) {
                    console.error('Error processing loyalty rewards:', error);
                }
            });
        }

        return transaction;
    }
}

@AuthedController('transaction')
export class TransactionController extends CrudController<Transaction, CreateTransactionDTO>(Transaction, CreateTransactionDTO) {
    constructor(private service: TransactionService) {
        super(service)
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction]),
        forwardRef(() => LoyaltyModule),
    ],
    controllers: [TransactionController],
    providers: [TransactionService],
    exports: [TransactionService]
})

export class TransactionModule {
}

