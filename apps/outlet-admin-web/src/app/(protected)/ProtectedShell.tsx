'use client';

import Header from '@/components/layouts/Header';
import Sidebar from '@/components/layouts/Sidebar';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useNewOrderSound } from '@/features/orders/hooks/useNewOrderSound';
import { ORDER_STATUS } from '@/features/orders/utils/order-status.util';

export default function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { columns } = useOrders();
  const pendingNewOrderCount = columns[ORDER_STATUS.PAID].length;

  useNewOrderSound(pendingNewOrderCount);

  return (
    <div style={styles.layoutWrapper}>
      <Sidebar />

      <div style={styles.mainContentArea}>
        <Header />

        <main style={styles.scrollableContent}>
          <div style={styles.innerContainer}>{children}</div>
        </main>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  layoutWrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  mainContentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollableContent: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
};
