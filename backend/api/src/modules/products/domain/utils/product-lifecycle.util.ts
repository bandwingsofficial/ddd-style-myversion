import { ProductStatus } from '../enums/product-status.enum';

export type ProductDeleteOutcome = 'PERMANENT' | 'ARCHIVED';

export function isProductPurchasableStatus(
  status: ProductStatus,
  isAvailable: boolean,
): boolean {
  return status === ProductStatus.ACTIVE && isAvailable;
}

export function isProductPubliclyVisibleStatus(status: ProductStatus): boolean {
  return (
    status === ProductStatus.ACTIVE || status === ProductStatus.OUT_OF_STOCK
  );
}

export function isProductCatalogHiddenStatus(status: ProductStatus): boolean {
  return (
    status === ProductStatus.INACTIVE ||
    status === ProductStatus.ARCHIVED ||
    status === ProductStatus.SOFT_DELETED
  );
}

export function isProductArchivedStatus(status: ProductStatus): boolean {
  return (
    status === ProductStatus.ARCHIVED || status === ProductStatus.SOFT_DELETED
  );
}

export function isProductRestorableStatus(status: ProductStatus): boolean {
  return isProductArchivedStatus(status);
}

export function shouldRemoveProductFromCartsAndOutlets(
  status: ProductStatus,
): boolean {
  return (
    status === ProductStatus.INACTIVE ||
    status === ProductStatus.ARCHIVED ||
    status === ProductStatus.SOFT_DELETED
  );
}

export function resolveProductDeleteOutcome(
  orderCount: number,
): ProductDeleteOutcome {
  return orderCount > 0 ? 'ARCHIVED' : 'PERMANENT';
}
