import {ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {Body, Module, Post, Response} from '@nestjs/common';
import {FastifyReply} from 'fastify';
import {createSigner} from 'fast-jwt';
import {IsEmail, IsNotEmpty, IsOptional} from 'class-validator';
import {NoAuthController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {UserType} from "../enums/user.enum";
import {compare, hash} from "bcryptjs";
import {User} from "../modules/user/user";
import {UserModule, UserService} from "../modules/user/user.module";
import {LogModule, LogService} from "../modules/log/log.module";
import {Public} from "../../auth/decorators/public.decorator";
import {CommsPreferenceModule, CommsPreferenceService} from "../modules/commsPreference/commsPreference.module";
import {CommunicationFrequency, Language} from "../enums/commsPreference.enum";


export class ValidateBody {
    @ApiProperty()
    token!: string;
}

export class LoginBody {

    @IsEmail()
    @IsOptional()
    @ApiProperty()
    email?: string;

    @IsEmail()
    @IsOptional()
    @ApiProperty()
    userName?: string;

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
        private commsPreferenceService: CommsPreferenceService
    ) {
    }

    @Post('login')
    @Public()
    @ApiOkResponse({type: AuthResponse})
    @ApiBody({type: LoginBody})
    async login(@Body() auth: LoginBody, @Response() response: FastifyReply) {

        const [user] = await this.userService.getQuery({
            where: [
                {email: auth.email},
                {userName: auth.userName}
            ],
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
    @Public()
    @ApiOkResponse({type: AuthResponse})
    @ApiBody({type: RegisterBody})
    async register(@Body() register: RegisterBody, @Response() response: FastifyReply): Promise<User> {

        const registerUser = register;
        registerUser.password = await hash(register.password, parseInt(process.env.SALT_ROUNDS || '10'));

        let [user] = await this.userService.getQuery({where: {email: register.email}}) || [];

        if (user) {
            void response.code(400).send({message: 'User already exists'});
        } else {

            user = await this.userService.create({
                ...registerUser, type: UserType.USER,
            });


            if (user) {
                await this.commsPreferenceService.create({
                    userId: user.id,
                    emailNotifications: CommunicationFrequency.DAILY,
                    inAppNotifications: CommunicationFrequency.IMMEDIATE,
                    smsNotifications: CommunicationFrequency.NEVER,
                    pushNotifications: CommunicationFrequency.IMMEDIATE,
                    marketingEmails: CommunicationFrequency.WEEKLY,
                    newsletterEmails: CommunicationFrequency.WEEKLY,
                    matchReminders: CommunicationFrequency.DAILY,
                    language: Language.EN
                });

            } else {
                void response.code(400).send({message: 'Something went wrong..'});
            }
        }
        return user
    }
}

@Module({
    imports: [UserModule, LogModule, CommsPreferenceModule],
    controllers: [AuthController]
})
export class AuthModule {
}
