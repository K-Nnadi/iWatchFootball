import {ApiBody, ApiOkResponse, ApiOperation, ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {Body, Get, Module, Post, Response} from '@nestjs/common';
import {FastifyReply} from 'fastify';
import {createSigner} from 'fast-jwt';
import {IsDateString, IsEmail, IsEnum, IsISO31661Alpha2, IsNotEmpty, IsOptional, MaxLength, MinLength} from 'class-validator';
import {NoAuthController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {compare, hash} from "bcryptjs";
import {User} from "../modules/user/user.entity";
import {UserModule, UserService} from "../modules/user/user.module";
import {LogModule} from "../modules/log/log.module";
import {Public} from "../../auth/decorators/public.decorator";
import {AuthThrottle} from "../../auth/rate-limit/auth-throttle.decorator";
import {CommsPreferenceModule, CommsPreferenceService} from "../modules/commsPreference/commsPreference.module";
import {CommunicationFrequency, Language} from "../enums/commsPreference.enum";
import {UserRole} from "../../auth/types/security.types";
import {SecurityQuestion} from "../enums/securityQuestion.enum";
import {UserSecurityAnswerModule} from "../modules/userSecurityAnswer/userSecurityAnswer.module";
import {UserSecurityAnswerService} from "../modules/userSecurityAnswer/userSecurityAnswer.service";
import {UserAdPreferenceModule} from "../modules/userAdPreference/userAdPreference.module";
import {UserAdPreferenceService} from "../modules/userAdPreference/userAdPreference.service";


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
    @ApiProperty({ enum: SecurityQuestion })
    @IsEnum(SecurityQuestion)
    securityQuestion!: SecurityQuestion;

    @ApiProperty({ minLength: 2, maxLength: 128 })
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(128)
    securityAnswer!: string;

    @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD) — used for age-gating adult content' })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code, e.g. GB' })
    @IsOptional()
    @IsISO31661Alpha2()
    country?: string;
}

export class ForgotPasswordChallengeBody {
    @IsEmail()
    @IsOptional()
    @ApiPropertyOptional()
    email?: string;

    @IsOptional()
    @ApiPropertyOptional()
    userName?: string;
}

export class ForgotPasswordChallengeResponse {
    @ApiProperty({ enum: SecurityQuestion })
    question!: SecurityQuestion;
}

export class ForgotPasswordResetBody {
    @IsEmail()
    @IsOptional()
    @ApiPropertyOptional()
    email?: string;

    @IsOptional()
    @ApiPropertyOptional()
    userName?: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(128)
    securityAnswer!: string;

    @ApiProperty({ minLength: 8, maxLength: 32 })
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    newPassword!: string;
}

export class SecurityQuestionsResponse {
    @ApiProperty({ enum: SecurityQuestion, isArray: true })
    questions!: SecurityQuestion[];
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
        private commsPreferenceService: CommsPreferenceService,
        private userSecurityAnswerService: UserSecurityAnswerService,
        private userAdPreferenceService: UserAdPreferenceService,
    ) {
    }

    private async resolveUserByEmailOrUserName(email?: string, userName?: string): Promise<User | null> {
        if (email) {
            const users = await this.userService.getQuery({ where: { email: email.toLowerCase() } });
            return users[0] ?? null;
        }
        if (userName) {
            const users = await this.userService.getQuery({ where: { userName } });
            return users[0] ?? null;
        }
        return null;
    }

    @Get('security-questions')
    @Public()
    @ApiOperation({ summary: 'List available security questions', operationId: 'getSecurityQuestions' })
    @ApiOkResponse({ type: SecurityQuestionsResponse })
    getSecurityQuestions(): SecurityQuestionsResponse {
        return { questions: Object.values(SecurityQuestion) };
    }

    @Post('forgot-password/challenge')
    @Public()
    @AuthThrottle()
    @ApiOperation({ summary: 'Get security question for account recovery', operationId: 'forgotPasswordChallenge' })
    @ApiOkResponse({ type: ForgotPasswordChallengeResponse })
    @ApiBody({ type: ForgotPasswordChallengeBody })
    async forgotPasswordChallenge(
        @Body() body: ForgotPasswordChallengeBody,
        @Response() response: FastifyReply,
    ): Promise<void> {
        if (!body.email && !body.userName) {
            void response.code(400).send({ message: 'Either email or userName must be provided' });
            return;
        }

        const user = await this.resolveUserByEmailOrUserName(body.email, body.userName);
        if (!user) {
            void response.code(404).send({ message: 'Account not found' });
            return;
        }

        const security = await this.userSecurityAnswerService.findByUserId(user.id);
        if (!security) {
            void response.code(400).send({ message: 'No security question is set for this account' });
            return;
        }

        void response.code(200).send({ question: security.question });
    }

    @Post('forgot-password/reset')
    @Public()
    @AuthThrottle()
    @ApiOperation({ summary: 'Reset password using security question answer', operationId: 'forgotPasswordReset' })
    @ApiBody({ type: ForgotPasswordResetBody })
    async forgotPasswordReset(
        @Body() body: ForgotPasswordResetBody,
        @Response() response: FastifyReply,
    ): Promise<void> {
        if (!body.email && !body.userName) {
            void response.code(400).send({ message: 'Either email or userName must be provided' });
            return;
        }

        const user = await this.resolveUserByEmailOrUserName(body.email, body.userName);
        if (!user) {
            void response.code(404).send({ message: 'Account not found' });
            return;
        }

        const valid = await this.userSecurityAnswerService.verifyForUser(user.id, body.securityAnswer);
        if (!valid) {
            void response.code(401).send({ message: 'Incorrect security answer' });
            return;
        }

        const newPasswordHash = await hash(body.newPassword, parseInt(process.env.SALT_ROUNDS || '10', 10));
        await this.userService.update(user.id, { id: user.id, password: newPasswordHash });

        void response.code(200).send({ message: 'Password updated successfully' });
    }

    @Post('login')
    @Public()
    @AuthThrottle()
    @ApiOperation({summary: 'Login user', operationId: 'login'})
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
                where: {email: auth.email.toLowerCase()}
            });
            user = users[0];
        } else if (auth.userName) {
            const users = await this.userService.getQuery({
                where: {userName: auth.userName},
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
            const freshUser = await this.userService.getOne(user.id);
            const token = createSigner({key: process.env.JWT_SECRET, algorithm: 'HS256'})(freshUser ?? user);
            void response.code(200).send({
                user: freshUser ?? user, access_token: token
            });
        }
    }

    @Post('register')
    @Public()
    @AuthThrottle()
    @ApiOperation({summary: 'Register new user', operationId: 'register'})
    @ApiOkResponse({type: AuthResponse})
    @ApiBody({type: RegisterBody})
    async register(@Body() register: RegisterBody, @Response() response: FastifyReply): Promise<User | undefined> {

        const registerUser = register;
        
        // Convert email to lowercase
        registerUser.email = register.email.toLowerCase();
        registerUser.password = await hash(register.password, parseInt(process.env.SALT_ROUNDS || '10'));

        // Check if user with email already exists
        let [existingUserByEmail] = await this.userService.getQuery({where: {email: registerUser.email}}) || [];

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
            ...registerUser,
            type: UserRole.USER,
            dateOfBirth: register.dateOfBirth,
            country: register.country?.toUpperCase(),
        });

        if (user) {
            try {
                await this.userSecurityAnswerService.createForUser(
                    user.id,
                    register.securityQuestion,
                    register.securityAnswer,
                );

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

                await this.userAdPreferenceService.getOrCreate(user.id);

                const freshUser = await this.userService.getOne(user.id);
                const tokenUser = freshUser ?? user;
                const token = createSigner({key: process.env.JWT_SECRET, algorithm: 'HS256'})(tokenUser);
                void response.code(200).send({ user: tokenUser, access_token: token });
            } catch (err) {
                // Roll back the user record so the same email/username can be used again
                await this.userService.delete(user.id);
                console.error('Registration failed, rolled back user:', err);
                void response.code(500).send({ message: 'Registration failed. Please try again.' });
            }
        } else {
            void response.code(400).send({message: 'Something went wrong..'});
        }
    }
}

@Module({
    imports: [UserModule, LogModule, CommsPreferenceModule, UserSecurityAnswerModule, UserAdPreferenceModule],
    controllers: [AuthController]
})
export class AuthModule {
}
