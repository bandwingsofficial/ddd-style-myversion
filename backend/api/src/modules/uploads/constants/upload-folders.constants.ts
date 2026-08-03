// src/modules/uploads/constants/upload-folders.constants.ts

export const UploadFolders = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CUSTOMERS: 'customers',
  BRANDS: 'brands',
  ORDERS: 'orders',
  OUTLETS: 'outlets',
  BANNERS: 'banners',
  TEMP: 'temp',
} as const;

export type UploadFolder = (typeof UploadFolders)[keyof typeof UploadFolders];
