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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [sortOrder, setSortOrder] = useState<"none" | "low-high" | "high-low">("none");

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
    const val = p?.discountPrice ?? p?.price?.discountPrice ?? p?.price?.value ?? p?.price ?? 0;
    return parseFloat(val) || 0;
  };

  // Logic to filter products before passing them to the list
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery) {
      result = result.filter((item) => {
        const name = (item.product as any)?.name?.value || (item.product as any)?.name || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Status Filter
    if (statusFilter !== "all") {
      const target = statusFilter === "active";
      result = result.filter((item) => item.isAvailable === target);
    }

    // Sorting
    if (sortOrder === "low-high") {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortOrder === "high-low") {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return result;
  }, [products, searchQuery, statusFilter, sortOrder]);

  if (loading) return <div style={styles.loading}>Loading products...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Product Management</h1>
          <p style={styles.pageSubtitle}>Search and manage your outlet inventory</p>
        </div>
      </div>

      {/* --- Filter Section --- */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <div style={styles.selectContainer}>
            <Filter size={14} style={styles.selectIcon} />
            <select
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div style={styles.selectContainer}>
            <ArrowUpDown size={14} style={styles.selectIcon} />
            <select
              style={styles.select}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="none">Price Sort</option>
              <option value="low-high">Low to High</option>
              <option value="high-low">High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <ProductList initialProducts={filteredProducts} />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1024px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    minWidth: '280px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    gap: '12px',
  },
  selectContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '10px',
    color: '#64748b',
    pointerEvents: 'none',
  },
  select: {
    padding: '10px 12px 10px 32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#475569',
  },
  loading: {
    padding: '100px',
    textAlign: 'center',
    color: '#6b7280',
  }
};