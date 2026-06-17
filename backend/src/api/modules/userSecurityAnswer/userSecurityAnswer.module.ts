import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSecurityAnswer } from './userSecurityAnswer.entity';
import { UserSecurityAnswerService } from './userSecurityAnswer.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserSecurityAnswer])],
    providers: [UserSecurityAnswerService],
    exports: [UserSecurityAnswerService],
})
export class UserSecurityAnswerModule {}
