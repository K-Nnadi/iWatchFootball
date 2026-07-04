import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRating } from './userRating.entity';
import { UserRatingService } from './userRating.service';
import { UserRatingController } from './userRating.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserRating])],
    controllers: [UserRatingController],
    providers: [UserRatingService],
    exports: [UserRatingService],
})
export class UserRatingModule {}
