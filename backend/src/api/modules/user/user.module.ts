import {Injectable, Module, ForbiddenException} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateUserDTO, User} from "./user.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {FindManyOptions, Repository} from "typeorm";
import {Body, Param, Patch, Req, Get, Query, DefaultValuePipe, ParseIntPipe, ParseBoolPipe} from "@nestjs/common";
import {DeepPartial} from "typeorm";
import {RequestWithUser} from "../../../auth/types/auth.types";
import {ApiBody, ApiOperation, ApiOkResponse, ApiQuery} from "@nestjs/swagger";
import {UserType} from "../../enums/user.enum";
import {FastifyRequest} from "fastify";
import qs from "qs";
import {QS_OPTIONS} from "@iWatchFootball/base-tools/crud/query.options";
import {UserFavouriteTeamModule} from '../userFavouriteTeam/userFavouriteTeam.module';
import {UserFavouriteTeamService} from '../userFavouriteTeam/userFavouriteTeam.service';


type UserUpdatePayload = DeepPartial<User> & {
    favouriteTeamIds?: number[];
    favouriteTeamId?: number;
};

@Injectable()
export class UserService extends CrudRepoAdapter<User, CreateUserDTO> {
  constructor(
    @InjectRepository(User) private entityRepo: Repository<User>,
    private readonly favouriteTeamService: UserFavouriteTeamService,
  ) {
    super(entityRepo);
  }

  private async enrichUser(user: User | null): Promise<User | null> {
    if (!user) {
      return null;
    }
    const teamIdsByUser = await this.favouriteTeamService.getTeamIdsByUserIds([user.id]);
    user.favouriteTeamIds = teamIdsByUser.get(user.id) ?? [];
    return user;
  }

  private async enrichUsers(users: User[]): Promise<User[]> {
    if (users.length === 0) {
      return users;
    }
    const teamIdsByUser = await this.favouriteTeamService.getTeamIdsByUserIds(users.map((user) => user.id));
    for (const user of users) {
      user.favouriteTeamIds = teamIdsByUser.get(user.id) ?? [];
    }
    return users;
  }

  async getOne(findId: number): Promise<User | null> {
    const user = await this.entityRepo.findOne({ where: { id: findId } });
    return this.enrichUser(user);
  }

  async getAll(): Promise<User[]> {
    return this.enrichUsers(await super.getAll());
  }

  async getQuery(query: FindManyOptions<User>): Promise<User[]> {
    return this.enrichUsers(await super.getQuery(query));
  }

  async update(id: number, entity: UserUpdatePayload): Promise<User | null> {
    const { favouriteTeamIds, favouriteTeamId, ...rest } = entity;

    if (favouriteTeamIds !== undefined) {
      await this.favouriteTeamService.setFavouriteTeams(id, favouriteTeamIds);
    } else if (favouriteTeamId !== undefined) {
      await this.favouriteTeamService.setFavouriteTeams(
        id,
        favouriteTeamId != null ? [favouriteTeamId] : [],
      );
    }

    if (Object.keys(rest).length > 0) {
      await super.update(id, rest);
    }

    return this.getOne(id);
  }
}

@AuthedController('user')
export class UserController extends CrudController<User, CreateUserDTO>(User, CreateUserDTO){
  constructor(private service: UserService) {
    super(service)
  }

  @Get()
  @ApiOperation({summary: 'Get all Users', operationId: 'getAllUsers'})
  @ApiOkResponse({type: User, isArray: true})
  // @ts-ignore - Override with additional @Req() parameter for security filtering
  async getAll(@Req() req?: RequestWithUser): Promise<User[]> {
    // For USER role, restrict to only their own record
    if (req?.user && req.user.type === UserType.USER) {
      const user = await this.service.getOne(req.user.id);
      return user ? [user] : [];
    }
    // For ADMIN and MODERATOR, return all users
    return this.service.getAll();
  }

  @Get('query')
  @ApiOperation({summary: 'Get all Users', operationId: 'getQueryUser'})
  @ApiOkResponse({type: User, isArray: true})
  @ApiQuery({name: 'skip', required: false, type: Number, description: 'Number of records to skip'})
  @ApiQuery({name: 'take', required: false, type: Number, description: 'Number of records to take'})
  @ApiQuery({name: 'withDeleted', required: false, type: Boolean, description: 'Include soft deleted records'})
  @ApiQuery({name: 'loadEagerRelations', required: false, type: Boolean, description: 'Load eager relations'})
  @ApiQuery({name: 'transaction', required: false, type: Boolean, description: 'Use transaction'})
  @ApiQuery({name: 'comment', required: false, type: String, description: 'Query comment'})
  async getQuery(@Req() request: FastifyRequest & RequestWithUser,
                 @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
                 @Query('take', new DefaultValuePipe(100), ParseIntPipe) take?: number,
                 @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe) withDeleted?: boolean,
                 @Query('loadEagerRelations', new DefaultValuePipe(true), ParseBoolPipe) loadEagerRelations?: boolean,
                 @Query('transaction', new DefaultValuePipe(false), ParseBoolPipe) transaction?: boolean,
                 @Query('comment') comment?: string) {
    // For USER role, restrict to only their own record
    if (request.user && request.user.type === UserType.USER) {
      const user = await this.service.getOne(request.user.id);
      return user ? [user] : [];
    }
    // For ADMIN and MODERATOR, use the base implementation
    const query = qs.parse(request.url.split('?')[1] || '', QS_OPTIONS);
    return this.service.getQuery({...query, skip, take, withDeleted, loadEagerRelations, transaction});
  }

  @Get(':id')
  @ApiOperation({summary: 'Get one User', operationId: 'getOneUser'})
  @ApiOkResponse({type: User})
  // @ts-ignore - Override with additional @Req() parameter for security filtering
  async getOne(@Param('id') id: number, @Req() req?: RequestWithUser): Promise<User | null> {
    // For USER role, ensure they can only get their own record
    if (req?.user && req.user.type === UserType.USER && +id !== req.user.id) {
      throw new ForbiddenException('You can only view your own user record');
    }
    return this.service.getOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update one User', operationId: 'updateOneUser'})
  @ApiBody({type: User})
  @ApiOkResponse({type: User})
  // @ts-ignore - Override with additional @Req() parameter for security filtering
  async update(@Param('id') id: number, @Body() entity: DeepPartial<User>, @Req() req?: RequestWithUser): Promise<User | null> {
    // For USER role, ensure they can only update their own record
    if (req?.user && req.user.type === UserType.USER && +id !== req.user.id) {
      throw new ForbiddenException('You can only update your own user record');
    }
    return this.service.update(+id, entity);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserFavouriteTeamModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, UserFavouriteTeamModule]
})


export class UserModule {}
