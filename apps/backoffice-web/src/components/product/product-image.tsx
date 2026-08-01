'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';

import { getProductImageUrl } from '@/lib/image-url';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
}

export function ProductImage({
  src,
  alt,
  className = 'h-[52px] w-[52px] rounded-[14px]',
  iconSize = 16,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = getProductImageUrl(src);
  const showImage = !!resolved && !failed;

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden bg-[#ECFDF3] ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Package size={iconSize} className="text-slate-400" />
      )}
    </div>
  );
}
