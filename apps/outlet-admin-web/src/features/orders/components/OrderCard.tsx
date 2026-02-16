import React from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { Clock, MapPin, User } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onAction: (id: string, action: any) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAction }) => {
  const isHighValue = order.grandTotal > 500;

  // Helper to handle casing issues from backend
  const status = order.status?.toUpperCase();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 transition-all hover:shadow-md ${isHighValue ? 'border-l-4 border-l-emerald-500' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            {order.orderNumber}
          </span>
          {/* Customer Name Token */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100 mb-2">
            <User size={12} className="shrink-0" />
            <span className="text-[11px] font-bold uppercase truncate max-w-[120px]">
              {order.customerFullName}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">₹{order.grandTotal}</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <Clock size={12} />
            {format(new Date(order.createdAt), 'h:mm a')}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-700">
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

      {/* Address Snippet */}
      <div className="flex items-start gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        <p className="line-clamp-2">{order.address.addressText}</p>
      </div>

      {/* Actions */}
      <div className="grid gap-2">
        {/* New Order Actions */}
        {(status === 'PENDING' || status === 'PAYMENT_PENDING' || !status) && (
          <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => onAction(order.id, 'reject')}
               className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
               Reject
             </button>
             <button 
               onClick={() => onAction(order.id, 'accept')}
               className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
               Accept
             </button>
          </div>
        )}

        {/* Confirmed -> Preparing */}
        {status === 'CONFIRMED' && (
          <button 
            onClick={() => onAction(order.id, 'prepare')}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Start Preparing
          </button>
        )}

        {/* Preparing -> Out for Delivery */}
        {status === 'PREPARING' && (
          <button 
            onClick={() => onAction(order.id, 'deliver')}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
            Mark Ready & Dispatch
          </button>
        )}

        {/* Out for Delivery -> Delivered */}
        {(status === 'OUT_FOR_DELIVERY' || status === 'DISPATCH') && (
          <button 
            onClick={() => onAction(order.id, 'complete')}
            className="w-full px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
};