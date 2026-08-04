"use client";

import { useParams } from "next/navigation";
import { useMemo, useCallback } from "react";
import { useProductBySlug } from "@/features/products/hooks/useProductBySlug";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPriceBlock } from "@/components/product/ProductPriceBlock";
import { CompactAddToCart } from "@/components/product/CompactAddToCart";
import {
  ProductFeatureGrid,
  ProductLongDescription,
} from "@/components/product/ProductDetailSections";
import { ProductDetailAccordion } from "@/components/product/ProductDetailAccordion";
import { RelatedProductsCarousel } from "@/components/product/RelatedProductsCarousel";
import { ProductDetailSkeleton } from "@/components/product/ProductDetailSkeleton";
import { normalizeProductList } from "@/lib/product-normalizer";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { resolveProductPricing } from "@/lib/product-pricing";
import { toast } from "sonner";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { badgeStyles, layout, typography } from "@/lib/design-tokens";
import { categoryToSlug } from "@/lib/category-slug";

export default function ProductDetailsPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const {
    product: productData,
    availability,
    relatedProducts,
    unavailableMessage,
    loading: productLoading,
    error: productError,
  } = useProductBySlug(routeSlug);

  const { items, addItem, updateItem, removeItem } = useCartStore();
  const currentOutlet = useOutletStore((state) => state.selectedOutlet);
  const { isNoOutlet } = useDeliveryAppState();

  const product = useMemo(() => {
    if (!productData) return null;

    const p = productData as unknown as Record<string, unknown>;
    const nameField = p.name as { value?: string } | string | undefined;
    const name =
      typeof nameField === "object" && nameField !== null
        ? nameField.value || "Unknown Product"
        : String(nameField || "Unknown Product");
    const pricing = resolveProductPricing(p);

    const images = p.images as
      | { mainImageUrl?: string; galleryImageUrls?: string[] }
      | undefined;
    const mainImgPath = images?.mainImageUrl || "";
    const gallery: string[] = images?.galleryImageUrls || [];

    const category = p.category as { id?: string; name?: string } | undefined;

    return {
      id: String(p.id),
      displayName: name,
      currentPrice: pricing.sellingPrice,
      originalPrice: pricing.mrp,
      percent: pricing.discountPercent,
      hasDiscount: pricing.hasDiscount,
      mainImage: mainImgPath || "/placeholder.jpg",
      gallery: gallery.length > 0 ? gallery : mainImgPath ? [mainImgPath] : [],
      shortDescription: String(p.shortDescription || ""),
      longDescription: String(p.longDescription || ""),
      benefits: (p.benefits as string | null) ?? null,
      ingredients: (p.ingredients as string | null) ?? null,
      nutrition: (p.nutrition as string | null) ?? null,
      tags: (p.tags as string[]) || [],
      categoryId: category?.id,
      categoryName: category?.name,
    };
  }, [productData]);

  const isUnavailable = availability === "UNAVAILABLE";
  const normalizedRelatedProducts = useMemo(
    () =>
      normalizeProductList(
        relatedProducts as unknown as Record<string, unknown>[],
        [],
      ),
    [relatedProducts],
  );

  const cartItem = useMemo(
    () => items.find((i) => i.productId === product?.id),
    [items, product?.id],
  );
  const quantityInCart = cartItem?.quantity || 0;
  const cartDisabled = !currentOutlet?.id || isNoOutlet || isUnavailable;

  const handleAddToCart = useCallback(async () => {
    if (!currentOutlet?.id) {
      toast.error("Please select a delivery location first.");
      return;
    }
    if (isNoOutlet) {
      toast.error("We don't deliver to your current location yet.");
      return;
    }
    if (!product || product.originalPrice <= 0) return;

    await addItem({
      productId: product.id,
      outletId: currentOutlet.id,
      productName: product.displayName,
      productImage: product.mainImage,
      quantity: 1,
      unitPrice: product.originalPrice,
      discountPrice: product.currentPrice,
    });
  }, [currentOutlet, isNoOutlet, product, addItem]);

  const handleUpdateQty = useCallback(
    async (delta: number) => {
      if (!product || !cartItem) return;
      const newQty = cartItem.quantity + delta;
      if (newQty <= 0) await removeItem(String(product.id));
      else await updateItem(String(product.id), newQty);
    },
    [product, cartItem, removeItem, updateItem],
  );

  const breadcrumbItems = useMemo(() => {
    const crumbs = [];
    if (product?.categoryName) {
      crumbs.push({
        label: product.categoryName,
        href: product.categoryId
          ? `/menu?category=${encodeURIComponent(categoryToSlug(product.categoryName))}`
          : "/menu",
      });
    }
    if (product?.displayName) {
      crumbs.push({ label: product.displayName });
    }
    return crumbs;
  }, [product]);

  if (productLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="customer-page-shell flex-grow">
          <div className="mobile-container max-w-6xl">
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (productError || (!productLoading && !productData)) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="customer-page-shell flex-grow">
          <div className="mobile-container max-w-6xl ">
            <Breadcrumbs items={[{ label: "Product" }]} />
            <EmptyState
              emoji="🔍"
              title="Product not found"
              description={
                productError ??
                "This product may have been removed or is unavailable."
              }
              primaryAction={{
                label: "Browse Menu",
                onClick: () => {
                  window.location.href = "/menu";
                },
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="customer-page-shell flex-grow overflow-x-hidden">
        <div className="mobile-container max-w-6xl pt-6 animate-fade-in-up">
          <div
            className={`grid grid-cols-1 items-start gap-6 lg:gap-10 ${layout.productDetailSplit}`}
          >
            {product ? (
              <ProductGallery
                name={product.displayName}
                mainImage={product.mainImage}
                gallery={product.gallery}
              />
            ) : null}

            <div className="flex min-w-0 flex-col gap-4">
              <Breadcrumbs items={breadcrumbItems} className="mb-0" />

              {isUnavailable ? (
                <div
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
                  role="status"
                >
                  {unavailableMessage ?? "This product is no longer available."}
                </div>
              ) : null}

              <h1 className={typography.pageTitle}>{product?.displayName}</h1>

              {product?.shortDescription ? (
                <p className={typography.body}>{product.shortDescription}</p>
              ) : null}

              {product && product.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className={badgeStyles.tag}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : null}

              {product ? (
                <ProductPriceBlock
                  currentPrice={product.currentPrice}
                  originalPrice={product.originalPrice}
                  hasDiscount={product.hasDiscount}
                  discountPercent={product.percent}
                  outletName={currentOutlet?.name}
                />
              ) : null}

              {!isUnavailable && product ? (
                <CompactAddToCart
                  variant="detail"
                  quantityInCart={quantityInCart}
                  disabled={cartDisabled}
                  disabledLabel="Location Not Serviceable"
                  onAdd={() => void handleAddToCart()}
                  onUpdateQty={(delta) => void handleUpdateQty(delta)}
                />
              ) : null}

              <ProductFeatureGrid />

              {product ? (
                <ProductLongDescription description={product.longDescription} />
              ) : null}

              {product ? (
                <ProductDetailAccordion
                  ingredients={product.ingredients}
                  benefits={product.benefits}
                  nutrition={product.nutrition}
                />
              ) : null}
            </div>
          </div>

          {normalizedRelatedProducts.length > 0 ? (
            <RelatedProductsCarousel
              title={
                isUnavailable ? "You might also like" : "Related Products"
              }
              products={normalizedRelatedProducts}
            />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
