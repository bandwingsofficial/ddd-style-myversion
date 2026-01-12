// src/modules/auth/constants/token.constants.ts

export const TOKEN_CONSTANTS = {
  ACCESS: {
    TYPE: 'ACCESS',
    HEADER_NAME: 'authorization',
    PREFIX: 'Bearer',
  },

  REFRESH: {
    TYPE: 'REFRESH',
    BYTE_LENGTH: 64, // crypto.randomBytes
  },

  HASH: {
    ALGORITHM: 'sha256',
  },
} as const;
