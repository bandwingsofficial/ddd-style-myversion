import React from 'react';
import { Order } from '../types';
import { Clock } from 'lucide-react';
import { formatTimeIST } from '@/lib/format-datetime';
import { CustomerContactDisplay } from '@/features/orders/components/CustomerContactDisplay';
import { DeliveryAddressCard } from '@/features/orders/components/DeliveryAddressCard';
import {
  normalizeOrderStatus,
  ORDER_STATUS,
} from '../utils/order-status.util';

interface OrderCardProps {
  order: Order;
  onAction: (
    id: string,
    action: 'accept' | 'reject' | 'prepare' | 'ready' | 'dispatch' | 'complete',
  ) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAction }) => {
  const isHighValue = order.grandTotal > 500;
  const status = normalizeOrderStatus(order.status);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 transition-all hover:shadow-md ${isHighValue ? 'border-l-4 border-l-emerald-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            {order.orderNumber}
          </span>
          <CustomerContactDisplay
            order={order}
            compact
            className="mb-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100"
            nameClassName="text-[11px] uppercase truncate max-w-[120px]"
          />
          <h3 className="text-lg font-bold text-gray-800">₹{order.grandTotal}</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <Clock size={12} />
            {formatTimeIST(order.createdAt)}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {(order.items ?? []).map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm text-gray-700"
          >
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-bold">
                x{item.quantity}
              </span>
              <span className="truncate max-w-[150px]">{item.productName}</span>
            </div>
            <span className="text-gray-500">₹{item.totalPrice}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded bg-gray-50 p-2">
        <DeliveryAddressCard address={order.address} compact />
      </div>

      <div className="grid gap-2">
        {status === ORDER_STATUS.PAID && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAction(order.id, 'reject')}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onAction(order.id, 'accept')}
              className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Accept
            </button>
          </div>
        )}

        {status === ORDER_STATUS.PREPARING && (
          <button
            onClick={() => onAction(order.id, 'ready')}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            Prepared
          </button>
        )}

        {status === ORDER_STATUS.READY_TO_DISPATCH && (
          <button
            onClick={() => onAction(order.id, 'dispatch')}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            Dispatch
          </button>
        )}

        {status === ORDER_STATUS.OUT_FOR_DELIVERY && (
          <button
            onClick={() => onAction(order.id, 'complete')}
            className="w-full px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200"
          >
            DELIVERED
          </button>
        )}
      </div>
    </div>
  );
};
