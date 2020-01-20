export type DecodedToken = {
  email: string;
  sub: number;
  iat: number;
  exp: number;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  password: string;
  active: boolean;
  activationCode: string;
  activatedAt: string;
  lastLogin: string;
  tokenExpiration: string;
  createdAt: string;
  updatedAt: string;
};
