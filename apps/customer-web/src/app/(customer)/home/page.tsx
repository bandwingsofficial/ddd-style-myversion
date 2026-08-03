"use client";

import Header from "@/components/customer/Header";
import HomeBanner from "@/components/customer/HomeBanner";
import ProductsGrid from "@/components/product/ProductGrid";
import Footer from "@/components/customer/Footer";
import WhyChooseUs from "@/components/customer/whychoose";
import { CategoryCarousel } from "@/features/categories/components/CategoryCarousel";

export default function CustomerHomePage() {
  return (
    <>
      <Header />

      <main className="customer-page-shell customer-page-shell--with-cart w-full overflow-x-clip pt-[112px] md:pt-0">
        <HomeBanner />
        <CategoryCarousel />
        <ProductsGrid />
        <WhyChooseUs />
      </main>

      <Footer />
    </>
  );
}