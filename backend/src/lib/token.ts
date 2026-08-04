import jwt, { type SignOptions } from "jsonwebtoken";
import { getEnv } from "./env";

export interface TokenPayload {
  id: string;
}

// generate Access token.
export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: getEnv().JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getEnv().JWT_SECRET, options);
}

// generate refresh token
export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: getEnv().JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getEnv().JWT_REFRESH_SECRET, options);
}

//  both tokens at once (login / register).
export function generateAuthTokens(payload: TokenPayload) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

// Verify an access token
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getEnv().JWT_SECRET) as TokenPayload;
}

// Verify a refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getEnv().JWT_REFRESH_SECRET) as TokenPayload;
}
