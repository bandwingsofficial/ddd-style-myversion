// src/modules/auth/constants/auth-claims.ts

export const AuthClaims = {
  SUBJECT: 'sub',      // actorId
  SESSION_ID: 'sid',   // sessionId
  ACTOR_TYPE: 'at',    // ActorType
  TOKEN_VERSION: 'tv', // tokenVersion
} as const;
