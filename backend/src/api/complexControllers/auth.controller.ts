import {ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {Body, Module, Post, Response} from '@nestjs/common';
import {FastifyReply} from 'fastify';
import {createSigner} from 'fast-jwt';
import {IsEmail, IsNotEmpty, IsOptional, ValidateIf} from 'class-validator';
import {NoAuthController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {UserType} from "../enums/user.enum";
import {compare, hash} from "bcryptjs";
import {User} from "../modules/user/user";
import {UserModule, UserService} from "../modules/user/user.module";
import {LogModule, LogService} from "../modules/log/log.module";
import {Public} from "../../auth/decorators/public.decorator";
import {CommsPreferenceModule, CommsPreferenceService} from "../modules/commsPreference/commsPreference.module";
import {CommunicationFrequency, Language} from "../enums/commsPreference.enum";
import {UserRole} from "../../auth/types/security.types";


export class ValidateBody {
    @ApiProperty()
    token!: string;
}

export class LoginBody {

    @IsEmail()
    @IsOptional()
    @ApiProperty()
    email?: string;

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

        // Validate that either email or userName is provided
        if (!auth.email && !auth.userName) {
            void response.code(400).send({message: 'Either email or userName must be provided'});
            return;
        }

        // Find user by email or userName
        let user = null;
        if (auth.email) {
            const users = await this.userService.getQuery({
                where: {email: auth.email}
            });
            user = users[0];
        } else if (auth.userName) {
            const users = await this.userService.getQuery({
                where: {userName: auth.userName}
            });
            user = users[0];
        }

        console.log('user login', user);

        if (!user) {
            void response.code(401).send({message: 'Invalid Login'});
            return;
        }

        const passwordMatch = await compare(auth.password, user.password);

        if (!passwordMatch) {
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
    async register(@Body() register: RegisterBody, @Response() response: FastifyReply): Promise<User | undefined> {

        const registerUser = register;
        registerUser.password = await hash(register.password, parseInt(process.env.SALT_ROUNDS || '10'));

        // Check if user with email already exists
        let [existingUserByEmail] = await this.userService.getQuery({where: {email: register.email}}) || [];

        // Check if user with userName already exists
        let [existingUserByUserName] = await this.userService.getQuery({where: {userName: register.userName}}) || [];

        if (existingUserByEmail) {
            void response.code(400).send({message: 'User with this email already exists'});
            return;
        }

        if (existingUserByUserName) {
            void response.code(400).send({message: 'User with this username already exists'});
            return;
        }

        let user = await this.userService.create({
            ...registerUser, type: UserRole.USER,
        });

        if (user) {
            const commsPreference = await this.commsPreferenceService.create({
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
            
            // Update user with commsPreferenceId
            if (commsPreference) {
                user = await this.userService.update(user.id, {
                    commsPreferenceId: commsPreference.id
                });
            }
            
            const token = createSigner({key: process.env.JWT_SECRET, algorithm: 'HS256'})(user);
            void response.code(200).send({
                user, access_token: token
            });
        } else {
            void response.code(400).send({message: 'Something went wrong..'});
        }
    }
}

@Module({
    imports: [UserModule, LogModule, CommsPreferenceModule],
    controllers: [AuthController]
})
export class AuthModule {
}
