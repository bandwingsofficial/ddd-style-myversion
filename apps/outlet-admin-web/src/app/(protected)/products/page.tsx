"use client";

import { useEffect, useState, useMemo } from "react";
import { outletService } from "@/features/outlet/services/outletService";
import { OutletProduct } from "@/features/outlet/types";
import ProductList from "@/features/outlet/components/ProductList";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<OutletProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "hidden"
  >("all");
  const [sortOrder, setSortOrder] = useState<
    "none" | "low-high" | "high-low"
  >("none");

  const fetchData = async () => {
    try {
      const productsData = await outletService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to extract price for sorting
  const getProductPrice = (item: OutletProduct) => {
    const p = item.product as any;
    const val =
      p?.discountPrice ??
      p?.price?.discountPrice ??
      p?.price?.value ??
      p?.price ??
      0;

    return parseFloat(val) || 0;
  };

  // Logic to filter products before passing them to the list
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery) {
      result = result.filter((item) => {
        const name =
          (item.product as any)?.name?.value ||
          (item.product as any)?.name ||
          "";

        return name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
    }

    // Status Filter
    if (statusFilter !== "all") {
      const target = statusFilter === "active";
      result = result.filter(
        (item) => item.isAvailable === target
      );
    }

    // Sorting
    if (sortOrder === "low-high") {
      result.sort(
        (a, b) => getProductPrice(a) - getProductPrice(b)
      );
    } else if (sortOrder === "high-low") {
      result.sort(
        (a, b) => getProductPrice(b) - getProductPrice(a)
      );
    }

    return result;
  }, [products, searchQuery, statusFilter, sortOrder]);

  if (loading)
    return (
      <div style={styles.loading}>
        Loading products...
      </div>
    );

  return (
    <>
      <div
        className="products-page"
        style={styles.pageContainer}
      >
        <div
          className="products-page-header"
          style={styles.pageHeader}
        >
          <div>
            <h1 style={styles.pageTitle}>
              Product Management
            </h1>

            <p style={styles.pageSubtitle}>
              Search and manage your outlet inventory
            </p>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div
          className="products-filter-section"
          style={styles.filterSection}
        >
          <div
            className="products-search-box"
            style={styles.searchBox}
          >
            <Search
              size={18}
              style={styles.searchIcon}
            />

            <input
              type="text"
              placeholder="Search by name..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          <div
            className="products-filter-group"
            style={styles.filterGroup}
          >
            <div
              className="products-select-container"
              style={styles.selectContainer}
            >
              <Filter
                size={14}
                style={styles.selectIcon}
              />

              <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as any
                  )
                }
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="hidden">
                  Hidden
                </option>
              </select>
            </div>

            <div
              className="products-select-container"
              style={styles.selectContainer}
            >
              <ArrowUpDown
                size={14}
                style={styles.selectIcon}
              />

              <select
                style={styles.select}
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as any
                  )
                }
              >
                <option value="none">
                  Price Sort
                </option>

                <option value="low-high">
                  Low to High
                </option>

                <option value="high-low">
                  High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="products-list-wrapper">
          <ProductList
            initialProducts={filteredProducts}
          />
        </div>
      </div>

      {/* ================= MOBILE ONLY ================= */}
      <style jsx>{`
        .products-page {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .products-page-header {
          width: 100%;
          box-sizing: border-box;
        }

        .products-filter-section {
          width: 100%;
          box-sizing: border-box;
        }

        .products-search-box {
          box-sizing: border-box;
          min-width: 0;
        }

        .products-search-box input {
          box-sizing: border-box;
          min-width: 0;
        }

        .products-filter-group {
          min-width: 0;
        }

        .products-select-container {
          min-width: 0;
        }

        .products-select-container select {
          box-sizing: border-box;
          min-width: 0;
        }

        .products-list-wrapper {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* =========================
           MOBILE
           ========================= */

        @media (max-width: 767px) {
          .products-page {
            padding: 16px !important;
          }

          .products-page-header {
            margin-bottom: 18px !important;
          }

          .products-page-header h1 {
            font-size: 22px !important;
            line-height: 1.25 !important;
          }

          .products-page-header p {
            font-size: 13px !important;
            line-height: 1.45 !important;
          }

          /*
           * Search becomes full width.
           */
          .products-filter-section {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 18px !important;
          }

          .products-search-box {
            width: 100% !important;
            min-width: 0 !important;
            flex: none !important;
          }

          .products-search-box input {
            width: 100% !important;
            min-height: 42px;
            font-size: 14px !important;
          }

          /*
           * Filters stay side-by-side.
           */
          .products-filter-group {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) minmax(
                0,
                1fr
              ) !important;
            gap: 8px !important;
          }

          .products-select-container {
            width: 100% !important;
          }

          .products-select-container select {
            width: 100% !important;
            min-height: 42px;
            padding-left: 32px !important;
            padding-right: 8px !important;
            font-size: 13px !important;
            text-overflow: ellipsis;
          }

          .products-list-wrapper {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        /* =========================
           SMALL MOBILE
           ========================= */

        @media (max-width: 480px) {
          .products-page {
            padding: 12px !important;
          }

          .products-page-header {
            margin-bottom: 14px !important;
          }

          .products-page-header h1 {
            font-size: 20px !important;
          }

          .products-page-header p {
            font-size: 12px !important;
          }

          .products-filter-section {
            gap: 8px !important;
            margin-bottom: 14px !important;
          }

          .products-search-box input {
            min-height: 40px;
          }

          .products-filter-group {
            gap: 6px !important;
          }

          .products-select-container select {
            min-height: 40px;
            font-size: 12px !important;
          }
        }

        /* =========================
           VERY SMALL PHONES
           ========================= */

        @media (max-width: 360px) {
          .products-page {
            padding: 10px !important;
          }

          .products-page-header h1 {
            font-size: 19px !important;
          }

          .products-filter-group {
            gap: 5px !important;
          }

          .products-select-container select {
            padding-left: 28px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  pageContainer: {
    padding: "24px",
    maxWidth: "1024px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    boxSizing: "border-box",
    width: "100%",
  },

  pageHeader: {
    marginBottom: "24px",
  },

  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
    margin: 0,
  },

  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "4px",
  },

  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  searchBox: {
    position: "relative",
    flex: 1,
    minWidth: "280px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },

  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 40px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
  },

  filterGroup: {
    display: "flex",
    gap: "12px",
  },

  selectContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  selectIcon: {
    position: "absolute",
    left: "10px",
    color: "#64748b",
    pointerEvents: "none",
  },

  select: {
    padding: "10px 12px 10px 32px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    color: "#475569",
  },

  loading: {
    padding: "100px",
    textAlign: "center",
    color: "#6b7280",
  },
};