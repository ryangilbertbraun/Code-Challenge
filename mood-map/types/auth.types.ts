// Authentication type definitions

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
}
