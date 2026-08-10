"use client";

import Image from "next/image";

export default function HomeBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="
          relative
          h-[150px]
          w-full
          sm:h-[220px]
          md:h-[300px]
          lg:h-[380px]
          xl:h-[460px]
          2xl:h-[500px]
        "
      >
        <Image
          src="/images/homebanner.png"
          alt="Canten Hero Banner"
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-[center_center]
            sm:object-center
          "
        />
      </div>
    </section>
  );
}