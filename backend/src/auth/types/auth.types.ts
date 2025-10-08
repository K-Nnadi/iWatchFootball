import { UserType } from '../../api/enums/user.enum';

export interface JwtPayload {
  id: number;
  email: string;
  userName: string;
  type: UserType;
  iat?: number;
  exp?: number;
  sub?: string; // User ID for security context
  context?: {
    organizationId?: string;
    membershipId?: string;
    type: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    userName: string;
    firstName: string;
    lastName: string;
    type: UserType;
  };
}

// Request with user context for security features
export interface RequestWithUser extends Request {
  user?: JwtPayload;
}