import customerAxios from "@/http/axios/customerAxios";
import {
  ProductListItem,
  ProductDetails,
} from "../types/product.types";

/**
 * Fetch all public products
 */
export const getPublicProducts = async (): Promise<ProductListItem[]> => {
  const res = await customerAxios.get("/public/products");
  // Assuming backend returns { success: true, data: [...] }
  return res.data.data;
};

/**
 * Fetch product by slug
 */
export const getProductBySlug = async (
  slug: string
): Promise<ProductDetails> => {
  const res = await customerAxios.get(`/public/products/slug/${slug}`);
  // Assuming backend returns { success: true, data: { ...object } }
  return res.data.data;
};