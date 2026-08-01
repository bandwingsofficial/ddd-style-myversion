import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import CategoryProductsPage from "@/features/categories/components/CategoryProductsPage";

interface Props {
  params: {
    id: string;
  };
}

export default function Page({ params }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      {/* Consistent Compact Header */}
      <Header />

      {/* Main product view wrapper with balanced padding */}
      <main className="customer-page-shell flex-grow">
        <div className="mobile-container max-w-6xl w-full">
          <CategoryProductsPage categoryId={params.id} />
        </div>
      </main>

      {/* Consistent Bottom Footer */}
      <Footer />
    </div>
  );
}