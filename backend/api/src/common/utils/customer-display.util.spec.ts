import {
  getCustomerDisplayInfo,
  GUEST_CUSTOMER_LABEL,
} from './customer-display.util';

describe('getCustomerDisplayInfo', () => {
  it('prefers full name when available', () => {
    const info = getCustomerDisplayInfo({
      id: 'c1',
      fullName: 'Akshay Badiger',
      phone: '+91 9876543210',
      email: 'akshay@example.com',
    });

    expect(info.displayName).toBe('Akshay Badiger');
    expect(info.showPhoneLine).toBe(true);
  });

  it('falls back to phone when name is missing', () => {
    const info = getCustomerDisplayInfo({
      id: 'c1',
      phone: '+91 9876543210',
    });

    expect(info.displayName).toBe('+91 9876543210');
    expect(info.showPhoneLine).toBe(false);
  });

  it('falls back to email when name and phone are missing', () => {
    const info = getCustomerDisplayInfo({
      id: 'c1',
      email: 'customer@email.com',
    });

    expect(info.displayName).toBe('customer@email.com');
  });

  it('uses guest label when everything is missing', () => {
    const info = getCustomerDisplayInfo({ id: 'c1' });
    expect(info.displayName).toBe(GUEST_CUSTOMER_LABEL);
  });

  it('never returns UNKNOWN', () => {
    const info = getCustomerDisplayInfo({});
    expect(info.displayName).not.toMatch(/unknown/i);
  });
});
