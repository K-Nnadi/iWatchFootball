import { FindOptionsWhere } from 'typeorm';
import { RequestWithUser } from './auth.types';

export enum OperationType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Simple user roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

// Simple query modifier
export interface QueryModifier<T> {
  filter?: (req: RequestWithUser) => FindOptionsWhere<T>;
  fields?: Array<keyof T>;
}

// Role-based rules
export type RoleBasedRules<T> = {
  [role: string]: QueryModifier<T>;
  // @ts-ignore
  default?: QueryModifier<T>;
};

// Security rule configuration
export interface SecurityRuleConfig<T> {
  base: RoleBasedRules<T>;
  [OperationType.CREATE]?: Partial<RoleBasedRules<T>>;
  [OperationType.READ]?: Partial<RoleBasedRules<T>>;
  [OperationType.UPDATE]?: Partial<RoleBasedRules<T>>;
  [OperationType.DELETE]?: Partial<RoleBasedRules<T>>;
}

// Helper function to create role groups
export function createRoleGroup(...roles: UserRole[]): string {
  return roles.join(',');
}
