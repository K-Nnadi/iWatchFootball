import {ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {Body, Module, Post, Response} from '@nestjs/common';
import {FastifyReply} from 'fastify';
import {createSigner} from 'fast-jwt';
import {IsEmail, IsNotEmpty} from 'class-validator';
import {NoAuthController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {UserType} from "../enums/user.enum";
import {compare, hash} from "bcryptjs";
import {User} from "../modules/user/user";
import {UserModule, UserService} from "../modules/user/user.module";
import {LogModule} from "../modules/log/log.module";


export class ValidateBody {
    @ApiProperty()
    token!: string;
}

export class LoginBody {

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email!: string;

    @ApiProperty()
    @IsNotEmpty()
    password!: string;
}

export class RegisterBody extends PickType(User, ['firstName', 'lastName', 'email', 'password', 'userName'] as const) {
}


export class AuthResponse {

    @ApiPropertyOptional()
    access_token!: string;

    @ApiProperty({type: User})
    user!: User;

}

@NoAuthController('auth')
export class AuthController {

    constructor(
        private userService: UserService,
    ) {
    }

    @Post('login')
    @ApiOkResponse({type: AuthResponse})
    @ApiBody({type: LoginBody})
    async login(@Body() auth: LoginBody, @Response() response: FastifyReply) {

        const [user] = await this.userService.getQuery({
            where: {email: auth.email},
        }) || [];
        console.log('user login', user);

        const passwordMatch = await compare(auth.password, user.password);

        if (!user || !passwordMatch) {
            void response.code(401).send({message: 'Invalid Login'});
        } else {
            const token = createSigner({key: process.env.JWT_SECRET, algorithm: 'HS256'})(user);
            void response.code(200).send({
                user, access_token: token
            });
        }
    }

    @Post('register')
    @ApiOkResponse({type: AuthResponse})
    @ApiBody({type: RegisterBody})
    async register(@Body() register: RegisterBody, @Response() response: FastifyReply) {

        const registerUser = register;
        registerUser.password = await hash(register.password, parseInt(process.env.SALT_ROUNDS || '10'));

        const [user] = await this.userService.getQuery({where: {email: register.email}}) || [];

        if (user) {
            void response.code(400).send({message: 'User already exists'});
        } else {

            const user = await this.userService.create({
                ...registerUser, type: UserType.USER,
            });

            if (user) {


            } else {
                void response.code(400).send({message: 'Something went wrong..'});
            }
        }
    }
}

@Module({
    imports: [UserModule, LogModule],
    controllers: [AuthController]
})
export class AuthModule {
}
