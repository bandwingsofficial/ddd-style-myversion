import Header from '@/components/layouts/Header';
import Sidebar from '@/components/layouts/Sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.layoutWrapper}>
      {/* Sidebar - Fixed width and high-contrast */}
      <Sidebar />

      {/* Main Area - Flex-1 to fill remaining space */}
      <div style={styles.mainContentArea}>
        <Header />

        <main style={styles.scrollableContent}>
          <div style={styles.innerContainer}>
            {children}
          </div>
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
    backgroundColor: '#f8fafc', // Light slate background for high-end SaaS feel
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
    padding: '32px', // Balanced padding for pro layout
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    maxWidth: '1200px', // Prevents content from over-stretching on large screens
    margin: '0 auto',
    width: '100%',
  },
};