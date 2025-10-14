import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../api/modules/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SecurityInterceptor } from './interceptors/security.interceptor';

@Module({
  imports: [
    PassportModule,
    UserModule,
  ],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, SecurityInterceptor],
  exports: [JwtAuthGuard, RolesGuard, SecurityInterceptor],
})
export class AuthModule {}
