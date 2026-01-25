// src/features/products/utils/product-helpers.ts

// ✅ 1. Point this to your Backend API
const BACKEND_URL = "http://api.dev.local:4000"; 

/**
 * UNIVERSAL IMAGE EXTRACTOR
 */
export const getProductImage = (product: any): string | null => {
  if (!product) return null;

  const rawImage =
    product.images ||
    product.image ||
    product.mainImage ||
    product.thumbnail ||
    product.coverImage;

  let path = "";

  if (Array.isArray(rawImage)) {
    path = rawImage[0] || "";
  } else if (typeof rawImage === "object" && rawImage !== null) {
    path = rawImage.url || rawImage.mainImage || rawImage.value || "";
  } else if (typeof rawImage === "string") {
    path = rawImage;
  }

  if (!path || path.trim() === "") return null;

  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }

  // Handle relative paths from DB
  if (!path.startsWith("/") && !path.includes("/")) {
    path = `/images/products/${path}`;
  }
  
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

/**
 * UNIVERSAL PRICE CALCULATOR (Fixed for your JSON)
 */
export const getProductPrice = (product: any) => {
  let original = 0;
  let current = 0;
  let hasDiscount = false;

  const parse = (val: any) => {
    if (val === undefined || val === null) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const rawPrice = product.price;

  // CASE 1: Simple Number
  if (typeof rawPrice === "number" || typeof rawPrice === "string") {
    original = parse(rawPrice);
    current = original;
  } 
  // CASE 2: Price Object (Matches your JSON: { originalPrice: 100, discountPrice: 50 })
  else if (typeof rawPrice === "object" && rawPrice !== null) {
    
    // Priority: Check for explicit "originalPrice" first
    if ('originalPrice' in rawPrice) {
        original = parse(rawPrice.originalPrice);
    } else if ('value' in rawPrice) {
        original = parse(rawPrice.value);
    } else {
        original = parse(rawPrice.amount || rawPrice.price || 0);
    }

    // Check for discount
    const discountVal = rawPrice.discountPrice || rawPrice.salePrice;
    
    if (discountVal !== undefined && discountVal !== null) {
      const discountNum = parse(discountVal);
      // Discount must be greater than 0 and less than original price
      if (discountNum > 0 && discountNum < original) {
        current = discountNum;
        hasDiscount = true;
      } else {
        current = original;
      }
    } else {
      current = original;
    }
  }

  return { original, current, hasDiscount };
};

export const getProductName = (product: any): string => {
  if (!product) return "Unknown Product";
  if (typeof product.name === "string") return product.name;
  return product.name?.value || "Unknown Product";
};

export const getProductSlug = (product: any): string => {
  if (!product) return "#";
  if (typeof product.slug === "string") return product.slug;
  return product.slug?.value || "#";
};