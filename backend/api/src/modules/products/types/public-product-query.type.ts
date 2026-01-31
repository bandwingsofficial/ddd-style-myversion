export type PublicProductQuery = {
  categoryId?: string;
  search?: string;
  trending?: boolean;

  page?: number;
  limit?: number;
};
