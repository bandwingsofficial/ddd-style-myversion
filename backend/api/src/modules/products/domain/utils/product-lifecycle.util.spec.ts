import {
  isProductArchivedStatus,
  isProductCatalogHiddenStatus,
  isProductPubliclyVisibleStatus,
  isProductPurchasableStatus,
  isProductRestorableStatus,
  resolveProductDeleteOutcome,
  shouldRemoveProductFromCartsAndOutlets,
} from './product-lifecycle.util';
import { ProductStatus } from '../enums/product-status.enum';

describe('product-lifecycle.util', () => {
  describe('isProductPurchasableStatus', () => {
    it('allows active available products', () => {
      expect(isProductPurchasableStatus(ProductStatus.ACTIVE, true)).toBe(true);
    });

    it('blocks inactive or unavailable products', () => {
      expect(isProductPurchasableStatus(ProductStatus.ACTIVE, false)).toBe(
        false,
      );
      expect(isProductPurchasableStatus(ProductStatus.OUT_OF_STOCK, true)).toBe(
        false,
      );
      expect(isProductPurchasableStatus(ProductStatus.ARCHIVED, true)).toBe(
        false,
      );
    });
  });

  describe('isProductPubliclyVisibleStatus', () => {
    it('shows active and out-of-stock products in catalog', () => {
      expect(isProductPubliclyVisibleStatus(ProductStatus.ACTIVE)).toBe(true);
      expect(isProductPubliclyVisibleStatus(ProductStatus.OUT_OF_STOCK)).toBe(
        true,
      );
    });

    it('hides inactive and archived products from catalog', () => {
      expect(isProductPubliclyVisibleStatus(ProductStatus.INACTIVE)).toBe(
        false,
      );
      expect(isProductPubliclyVisibleStatus(ProductStatus.ARCHIVED)).toBe(
        false,
      );
      expect(isProductPubliclyVisibleStatus(ProductStatus.SOFT_DELETED)).toBe(
        false,
      );
    });
  });

  describe('resolveProductDeleteOutcome', () => {
    it('archives products with order history', () => {
      expect(resolveProductDeleteOutcome(1)).toBe('ARCHIVED');
      expect(resolveProductDeleteOutcome(5)).toBe('ARCHIVED');
    });

    it('permanently deletes products without order history', () => {
      expect(resolveProductDeleteOutcome(0)).toBe('PERMANENT');
    });
  });

  describe('shouldRemoveProductFromCartsAndOutlets', () => {
    it('removes dependencies for hidden lifecycle states', () => {
      expect(
        shouldRemoveProductFromCartsAndOutlets(ProductStatus.INACTIVE),
      ).toBe(true);
      expect(
        shouldRemoveProductFromCartsAndOutlets(ProductStatus.ARCHIVED),
      ).toBe(true);
      expect(
        shouldRemoveProductFromCartsAndOutlets(ProductStatus.SOFT_DELETED),
      ).toBe(true);
    });

    it('keeps dependencies for active catalog states', () => {
      expect(shouldRemoveProductFromCartsAndOutlets(ProductStatus.ACTIVE)).toBe(
        false,
      );
      expect(
        shouldRemoveProductFromCartsAndOutlets(ProductStatus.OUT_OF_STOCK),
      ).toBe(false);
    });
  });

  describe('isProductRestorableStatus', () => {
    it('allows restore only for archived lifecycle states', () => {
      expect(isProductRestorableStatus(ProductStatus.ARCHIVED)).toBe(true);
      expect(isProductRestorableStatus(ProductStatus.SOFT_DELETED)).toBe(true);
      expect(isProductRestorableStatus(ProductStatus.ACTIVE)).toBe(false);
      expect(isProductRestorableStatus(ProductStatus.INACTIVE)).toBe(false);
    });
  });

  describe('isProductArchivedStatus', () => {
    it('identifies archived and soft-deleted products', () => {
      expect(isProductArchivedStatus(ProductStatus.ARCHIVED)).toBe(true);
      expect(isProductArchivedStatus(ProductStatus.SOFT_DELETED)).toBe(true);
      expect(isProductArchivedStatus(ProductStatus.ACTIVE)).toBe(false);
    });
  });

  describe('isProductCatalogHiddenStatus', () => {
    it('identifies products hidden from customer catalog', () => {
      expect(isProductCatalogHiddenStatus(ProductStatus.INACTIVE)).toBe(true);
      expect(isProductCatalogHiddenStatus(ProductStatus.ARCHIVED)).toBe(true);
      expect(isProductCatalogHiddenStatus(ProductStatus.ACTIVE)).toBe(false);
    });
  });
});
