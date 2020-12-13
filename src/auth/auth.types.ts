export type DecodedToken = {
  id: number;
  permissions: string[];
  email: string;
  lastLogin: string;
  sub: number;
  iat: number;
  exp: number;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  password: string;
  active: boolean;
  permissions: string[];
  activationCode: string;
  activatedAt: string;
  lastLogin: string;
  tokenExpiration: string;
  createdAt: string;
  updatedAt: string;
};
