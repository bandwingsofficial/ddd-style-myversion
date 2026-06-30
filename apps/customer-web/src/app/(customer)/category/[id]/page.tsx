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
      <main className="flex-grow pt-40 pb-16 max-w-6xl w-full mx-auto px-4">
        <CategoryProductsPage categoryId={params.id} />
      </main>

      {/* Consistent Bottom Footer */}
      <Footer />
    </div>
  );
}