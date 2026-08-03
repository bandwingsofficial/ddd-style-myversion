"use client";

import Image from "next/image";

export default function HomeBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[180px] sm:h-[240px] md:h-[320px] lg:h-[420px] xl:h-[500px]">
        <Image
          src="/images/homebanner.png"
          alt="Canten Hero Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}