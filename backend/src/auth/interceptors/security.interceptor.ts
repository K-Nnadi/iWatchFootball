import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../types/auth.types';
import { UserRole, OperationType } from '../types/security.types';
import { UserType } from '../../api/enums/user.enum';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get security rules from the controller (entity)
    const securityRules = this.reflector.get('security_rules', controller);
    
    if (!securityRules) {
      // No security rules defined, allow access
      return next.handle();
    }

    // Determine the operation type based on the HTTP method
    const operationType = this.getOperationType(request.method);
    
    // Get user role and map UserType to UserRole
    const userType = request.user?.type as UserType;
    
    // Handle public access (no authentication required)
    let userRole: UserRole | 'public';
    if (!userType) {
      // Check if this entity allows public access
      const hasPublicAccess = this.checkPublicAccess(securityRules);
      if (hasPublicAccess) {
        userRole = 'public';
      } else {
        throw new UnauthorizedException('User not authenticated');
      }
    } else {
      // Map UserType to UserRole
      userRole = this.mapUserTypeToUserRole(userType);
    }

    // Check if user has permission for this operation
    const hasPermission = this.checkPermission(securityRules, userRole, operationType);
    
    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions for ${operationType} operation`);
    }

    return next.handle();
  }

  private getOperationType(method: string): OperationType {
    switch (method.toUpperCase()) {
      case 'GET':
        return OperationType.READ;
      case 'POST':
        return OperationType.CREATE;
      case 'PUT':
      case 'PATCH':
        return OperationType.UPDATE;
      case 'DELETE':
        return OperationType.DELETE;
      default:
        return OperationType.READ;
    }
  }

  private checkPermission(securityRules: any, userRole: UserRole | 'public', operationType: OperationType): boolean {
    // Check operation-specific rules first
    const operationRules = securityRules[operationType];
    if (operationRules) {
      // Check if user role has permission for this operation
      if (operationRules[userRole]) {
        return true;
      }
      
      // Check default rule for this operation
      if (operationRules.default) {
        return false; // Default denies access
      }
    }

    // Fall back to base rules
    const baseRules = securityRules.base;
    if (baseRules[userRole]) {
      return true;
    }

    // Check default rule
    if (baseRules.default) {
      return false; // Default denies access
    }

    return false; // No rules found, deny access
  }

  private checkPublicAccess(securityRules: any): boolean {
    // Check if the entity has public access defined
    const baseRules = securityRules.base;
    return baseRules && baseRules['public'];
  }

  private mapUserTypeToUserRole(userType: UserType): UserRole {
    switch (userType) {
      case UserType.ADMIN:
        return UserRole.ADMIN;
      case UserType.MODERATOR:
        return UserRole.MODERATOR;
      case UserType.USER:
        return UserRole.USER;
      default:
        return UserRole.USER;
    }
  }
}
