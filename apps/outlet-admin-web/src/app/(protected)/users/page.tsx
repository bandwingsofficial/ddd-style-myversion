import React from 'react';

export default function UsersPage() {
  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Users</h2>
        <p style={styles.subtitle}>
          Manage outlet users, roles, and access permissions
        </p>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Admin User</td>
              <td style={styles.td}>admin@company.com</td>
              <td style={styles.td}>Outlet Admin</td>
              <td style={styles.td}>
                <span style={styles.active}>Active</span>
              </td>
            </tr>

            <tr>
              <td style={styles.td}>Staff Member</td>
              <td style={styles.td}>staff@company.com</td>
              <td style={styles.td}>Staff</td>
              <td style={styles.td}>
                <span style={styles.inactive}>Inactive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '13px',
    color: '#475569',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
  },
  active: {
    color: '#16a34a',
    fontWeight: 500,
  },
  inactive: {
    color: '#dc2626',
    fontWeight: 500,
  },
};
