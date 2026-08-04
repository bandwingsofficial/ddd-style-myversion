-- AlterEnum
ALTER TYPE "ActorType" ADD VALUE 'SYSTEM';

-- AlterTable (Cart.orderId may remain for legacy; relation is now one-to-many via Order.cartId)
-- No structural change required for Cart side.
