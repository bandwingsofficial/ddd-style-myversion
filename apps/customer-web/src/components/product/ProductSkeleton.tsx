"use client";

export default function ProductSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-line title" />
        <div className="skeleton-line price" />
      </div>

      <style jsx>{`
        .skeleton-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          padding: 8px;
          height: 330px;
        }

        .skeleton-image {
          height: 240px;
          background: #f1f5f9;
          border-radius: 18px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-content {
          padding: 12px 8px;
        }

        .skeleton-line {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .title { width: 70%; height: 16px; margin-bottom: 8px; }
        .price { width: 40%; height: 14px; }

        .skeleton-card * {
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}