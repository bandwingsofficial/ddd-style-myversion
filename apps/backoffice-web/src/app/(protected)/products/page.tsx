"use client";

import { useState } from "react";
import { ProductsTable } from "@/features/products/components/products-table";
import CreateProductModal from "@/features/products/components/create-product-dialog";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useProducts } from "@/features/products/hooks/use-products";

export default function ProductsPage() {
  const { products, loading, refresh } = useProducts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters by Product Name
  const filteredProducts = products.filter((p) =>
    p.name.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.iconCircleHeader}>
            <LayoutGrid size={22} color="#10b981" />
          </div>
          <div>
            <h1 style={styles.title}>Products Management</h1>
            <p style={styles.subtitle}>Super Admin Control Panel</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#64748b" style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button onClick={() => setIsCreateModalOpen(true)} style={styles.createBtn}>
            <Plus size={18} /> Create Product
          </button>
        </div>
      </div>

      <ProductsTable 
        products={filteredProducts} 
        loading={loading} 
        refresh={refresh} 
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateProductModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => { refresh(); setIsCreateModalOpen(false); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px 32px", backgroundColor: "#f8fafc", minHeight: "100vh" },
  header: { marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitleGroup: { display: "flex", alignItems: "center", gap: "12px" },
  iconCircleHeader: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", margin: 0, fontSize: "14px", fontWeight: 500 },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '12px' },
  searchInput: { padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '280px', fontSize: '14px', outline: 'none' },
  createBtn: { background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
};