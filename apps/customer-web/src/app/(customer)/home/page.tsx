"use client";

import Header from "@/components/customer/Header";
import HomeBanner from "@/components/customer/HomeBanner";
import Categories from "@/components/customer/Categories";
import ProductsGrid from "@/components/product/ProductGrid";
import Footer from "@/components/customer/Footer";
import WhyChooseUs from "@/components/customer/whychoose";

export default function CustomerHomePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <HomeBanner />
        <Categories />
        <ProductsGrid />
        <WhyChooseUs/>
      </main>
      <Footer />
    </>
  );
}
