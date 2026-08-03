import { Prisma } from '@prisma/client';
import {
  computeCartGrandTotal,
  computeCartItemTotals,
  computeLineTotal,
  computeLineTotalNumber,
  computeOrderItemTotals,
  computeOrderLineTotal,
  cartItemRowNeedsRepair,
  normalizeDiscountPrice,
  normalizeDiscountPriceNumber,
  repairPersistedCartItemRow,
  resolveCartItemPricingFromSources,
  resolveEffectivePrice,
  resolveEffectivePriceNumber,
  resolvePublicOutletEffectivePrice,
} from './product-pricing.util';
import { CartItem } from '../../modules/cart/domain/models/cart-item.model';
import { OrderItem } from '../../modules/orders/domain/models/order-item.model';

const D = Prisma.Decimal;

describe('product-pricing.util (pricing engine)', () => {
  describe('resolveEffectivePrice', () => {
    it('uses discount when > 0 and below original', () => {
      expect(resolveEffectivePrice(new D('50'), new D('45')).toString()).toBe(
        '45',
      );
    });

    it('falls back to original when discount is null', () => {
      expect(resolveEffectivePrice(new D('50'), null).toString()).toBe('50');
    });

    it('falls back to original when discount is zero', () => {
      expect(resolveEffectivePrice(new D('50'), new D('0')).toString()).toBe(
        '50',
      );
    });

    it('falls back to original when discount equals original', () => {
      expect(resolveEffectivePrice(new D('50'), new D('50')).toString()).toBe(
        '50',
      );
    });
  });

  describe('computeLineTotal', () => {
    it('calculates discounted totals', () => {
      expect(computeLineTotal(new D('50'), new D('45'), 2).toString()).toBe(
        '90',
      );
    });

    it('calculates non-discounted totals', () => {
      expect(computeLineTotal(new D('49.99'), null, 3).toString()).toBe(
        '149.97',
      );
    });

    it('supports quantity 5', () => {
      expect(computeLineTotal(new D('50'), new D('45'), 5).toString()).toBe(
        '225',
      );
    });

    it('handles decimal precision 99.95 x 2', () => {
      expect(computeLineTotal(new D('99.95'), null, 2).toString()).toBe(
        '199.9',
      );
    });
  });

  describe('computeCartItemTotals', () => {
    it('aggregates mixed cart lines', () => {
      const totals = computeCartItemTotals([
        { unitPrice: new D('50'), discountPrice: new D('45'), quantity: 2 },
        { unitPrice: new D('100'), discountPrice: null, quantity: 1 },
      ]);

      expect(totals.subtotal.toString()).toBe('200');
      expect(totals.afterDiscountTotal.toString()).toBe('190');
      expect(totals.discount.toString()).toBe('10');
      expect(totals.itemCount).toBe(3);
    });
  });

  describe('computeCartGrandTotal', () => {
    it('adds delivery fee to payable subtotal', () => {
      const result = computeCartGrandTotal(
        [{ unitPrice: new D('50'), discountPrice: new D('45'), quantity: 1 }],
        '20',
      );

      expect(result.afterDiscountTotal.toString()).toBe('45');
      expect(result.grandTotal.toString()).toBe('65');
    });
  });

  describe('resolveCartItemPricingFromSources', () => {
    it('uses product discount when no outlet override exists', () => {
      const pricing = resolveCartItemPricingFromSources({
        productOriginalPrice: '50',
        productDiscountPrice: '45',
      });

      expect(pricing.unitPrice.toString()).toBe('50');
      expect(pricing.discountPrice?.toString()).toBe('45');
      expect(pricing.effectivePrice.toString()).toBe('45');
    });

    it('uses outlet discount override below catalog original', () => {
      const pricing = resolveCartItemPricingFromSources({
        productOriginalPrice: '50',
        productDiscountPrice: null,
        outletDiscountOverride: '40',
      });

      expect(pricing.unitPrice.toString()).toBe('50');
      expect(pricing.discountPrice?.toString()).toBe('40');
      expect(pricing.effectivePrice.toString()).toBe('40');
    });

    it('uses outlet price override as new shelf price', () => {
      const pricing = resolveCartItemPricingFromSources({
        productOriginalPrice: '50',
        productDiscountPrice: '45',
        outletPriceOverride: '55',
      });

      expect(pricing.unitPrice.toString()).toBe('55');
      expect(pricing.discountPrice).toBeUndefined();
      expect(pricing.effectivePrice.toString()).toBe('55');
    });

    it('prefers outlet discount override over price override', () => {
      const effective = resolvePublicOutletEffectivePrice({
        productOriginalPrice: '50',
        productDiscountPrice: null,
        outletPriceOverride: '55',
        outletDiscountOverride: '40',
      });

      expect(effective.toString()).toBe('40');
    });
  });

  describe('legacy cart repair', () => {
    it('detects corrupt persisted rows', () => {
      expect(
        cartItemRowNeedsRepair({
          unitPrice: new D('50'),
          discountPrice: new D('45'),
          quantity: 1,
          lineTotal: new D('50'),
        }),
      ).toBe(true);
    });

    it('repairs corrupt persisted rows', () => {
      const repaired = repairPersistedCartItemRow({
        unitPrice: new D('50'),
        discountPrice: new D('45'),
        quantity: 2,
        lineTotal: new D('100'),
      });

      expect(repaired.lineTotal.toString()).toBe('90');
      expect(repaired.discountPrice?.toString()).toBe('45');
    });

    it('rehydrate repairs corrupt cart item in domain', () => {
      const item = CartItem.rehydrate({
        id: '1',
        cartId: 'c',
        productId: 'p',
        quantity: 2,
        unitPrice: new D('50'),
        discountPrice: new D('45'),
        lineTotal: new D('100'),
        productName: 'Sugar',
        productImage: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(item.getLineTotal().toString()).toBe('90');
    });
  });

  describe('order pricing bridge', () => {
    it('matches cart line totals as numbers', () => {
      const cartLine = computeLineTotalNumber(50, 45, 2);
      const orderLine = computeOrderLineTotal({
        unitPrice: 50,
        discountPrice: 45,
        quantity: 2,
      });

      expect(orderLine).toBe(cartLine);
      expect(orderLine).toBe(90);
    });

    it('creates order item from cart snapshot values', () => {
      const orderItem = OrderItem.create({
        id: '1',
        orderId: 'o',
        productId: 'p',
        productName: 'Sugar',
        productImage: '',
        quantity: 2,
        unitPrice: 50,
        discountPrice: 45,
      });

      expect(orderItem.getLineTotal().toNumber()).toBe(90);
    });

    it('aggregates order totals consistently', () => {
      const totals = computeOrderItemTotals([
        { unitPrice: 50, discountPrice: 45, quantity: 2 },
        { unitPrice: 100, discountPrice: null, quantity: 1 },
      ]);

      expect(totals.subtotal).toBe(200);
      expect(totals.afterDiscountTotal).toBe(190);
      expect(totals.discount).toBe(10);
    });
  });

  describe('normalizeDiscountPrice', () => {
    it('returns undefined for invalid discounts', () => {
      expect(
        normalizeDiscountPrice(new D('50'), new D('0')),
      ).toBeUndefined();
      expect(
        normalizeDiscountPrice(new D('50'), new D('50')),
      ).toBeUndefined();
      expect(
        normalizeDiscountPrice(new D('50'), new D('55')),
      ).toBeUndefined();
    });

    it('number variant mirrors decimal variant', () => {
      expect(normalizeDiscountPriceNumber(50, 0)).toBeUndefined();
      expect(normalizeDiscountPriceNumber(50, 45)).toBe(45);
      expect(resolveEffectivePriceNumber(50, 45)).toBe(45);
    });
  });

  describe('quantity transitions', () => {
    it('recalculates through 1 → 2 → 5 → 1', () => {
      const base = CartItem.createNew({
        id: '1',
        cartId: 'c',
        productId: 'p',
        quantity: 1,
        unitPrice: new D('50'),
        discountPrice: new D('45'),
        productName: 'Sugar',
        productImage: '',
      });

      const q2 = base.increaseQuantity(1);
      const q5 = q2.updateQuantity(5);
      const q1 = q5.updateQuantity(1);

      expect(q1.getLineTotal().toString()).toBe('45');
      expect(q5.getLineTotal().toString()).toBe('225');
    });
  });
});
