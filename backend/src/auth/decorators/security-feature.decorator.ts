import { SetMetadata } from '@nestjs/common';
import {
  RoleBasedRules,
  SecurityRuleConfig,
  UserRole,
  QueryModifier,
  OperationType,
} from '../types/security.types';

/**
 * Expands role groups in the security config to individual role entries
 */
function expandRoleGroups<T>(config: SecurityRuleConfig<T>): SecurityRuleConfig<T> {
  const result: SecurityRuleConfig<T> = {
    base: {} as RoleBasedRules<T>,
  };

  // Process base rules
  Object.entries(config.base).forEach(([key, rules]) => {
    if (key.includes(',')) {
      // This is a role group
      const roles = key.split(',');
      roles.forEach(role => {
        result.base[role] = rules;
      });
    } else {
      // Individual role or 'default'
      result.base[key] = rules;
    }
  });

  // Process operation-specific overrides
  Object.entries(config).forEach(([opKey, opRules]) => {
    if (opKey === 'base') return; // Skip base, already processed

    const operationType = opKey as unknown as OperationType;
    result[operationType] = {} as Partial<RoleBasedRules<T>>;

    if (!opRules) return;

    Object.entries(opRules).forEach(([roleKey, rules]) => {
      if (roleKey.includes(',')) {
        // This is a role group
        const roles = roleKey.split(',');
        roles.forEach(role => {
          // @ts-ignore
          result[operationType][role] = rules;
        });
      } else {
        // Individual role or 'default'
        // @ts-ignore
        result[operationType][roleKey] = rules;
      }
    });
  });

  return result;
}

/**
 * Simple decorator that applies security rules to an entity class
 * @param config Configuration of security rules for this entity
 */
export function SecurityFeature<T>(config: SecurityRuleConfig<T>) {
  // Process the config to expand role groups into individual role entries
  const processedConfig = expandRoleGroups<T>(config);
  return SetMetadata('security_rules', processedConfig);
}
