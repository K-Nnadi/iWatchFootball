import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../api/enums/user.enum';
import {UserRole} from "../types/security.types";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
