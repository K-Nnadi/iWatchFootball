import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateNewsArticleDTO, NewsArticle} from "./newsArticle.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class NewsArticleService extends CrudRepoAdapter<NewsArticle, CreateNewsArticleDTO> {
  constructor(@InjectRepository(NewsArticle) private entityRepo: Repository<NewsArticle>) {
    super(entityRepo);
  }
}

@AuthedController('newsArticle')
export class NewsArticleController extends CrudController<NewsArticle, CreateNewsArticleDTO>(NewsArticle, CreateNewsArticleDTO){
  constructor(private service: NewsArticleService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([NewsArticle])],
  controllers: [NewsArticleController],
  providers: [NewsArticleService],
  exports: [NewsArticleService]
})

export class NewsArticleModule {}


