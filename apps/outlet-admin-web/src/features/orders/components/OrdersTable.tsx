'use client';

import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { fetchOrderById } from '../api/orders';
import { Order } from '../types';
import { RotateCw, ShoppingBag, Receipt } from 'lucide-react';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';
import { CustomerContactDisplay } from '@/features/orders/components/CustomerContactDisplay';
import { DeliveryAddressCard } from '@/features/orders/components/DeliveryAddressCard';
import { OrderReceiptPreview } from '@/features/orders/components/OrderReceiptPreview';
import {
  normalizeOrderStatus,
  ORDER_STATUS,
  OrderBoardTab,
  STATUS_BADGE_COLORS,
} from '../utils/order-status.util';

export const OrdersTable = () => {
  const {
    columns,
    loading,
    pendingNewOrderCount,
    handleStatusChange,
    refresh,
  } = useOrders();

  const [activeTab, setActiveTab] =
    useState<OrderBoardTab>(ORDER_STATUS.PAID);

  const [selectedReceiptOrder, setSelectedReceiptOrder] =
    useState<Order | null>(null);

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <RotateCw
          className="animate-spin text-emerald-500"
          size={40}
        />

        <p className="text-gray-500 italic animate-pulse">
          Loading live orders...
        </p>
      </div>
    );
  }

  // Map the active tab to the correct data source from your hook
  const currentOrders = columns[activeTab] || [];

  const tabs: Array<{
    id: OrderBoardTab;
    label: string;
    count: number;
  }> = [
    {
      id: ORDER_STATUS.PAID,
      label: 'New Orders',
      count: columns[ORDER_STATUS.PAID].length,
    },
    {
      id: ORDER_STATUS.PREPARING,
      label: 'Preparing',
      count: columns[ORDER_STATUS.PREPARING].length,
    },
    {
      id: ORDER_STATUS.READY_TO_DISPATCH,
      label: 'Ready to Dispatch',
      count: columns[ORDER_STATUS.READY_TO_DISPATCH].length,
    },
    {
      id: ORDER_STATUS.OUT_FOR_DELIVERY,
      label: 'Out for Delivery',
      count: columns[ORDER_STATUS.OUT_FOR_DELIVERY].length,
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      count: columns.COMPLETED.length,
    },
  ];

  return (
    <>
      <div className="orders-mobile-page flex flex-col h-[calc(100vh-100px)]">
        {/* Header & Refresh */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Order Management
          </h1>

          <button
            onClick={refresh}
            className="text-sm font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
          >
            <RotateCw size={16} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="orders-mobile-tabs flex gap-2 mb-6 border-b border-gray-200 pb-1">
          {tabs.map((tab) => {
            const isNewOrdersTab =
              tab.id === ORDER_STATUS.PAID;

            const hasPendingNewOrders =
              isNewOrdersTab &&
              pendingNewOrderCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 
                  ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                  ${
                    hasPendingNewOrders
                      ? 'ring-2 ring-emerald-400/60 ring-offset-1 animate-pulse'
                      : ''
                  }
                `}
              >
                {tab.label}

                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100'
                  } ${
                    hasPendingNewOrders
                      ? 'bg-emerald-200 text-emerald-900'
                      : ''
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Section */}
        <div className="orders-mobile-table bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="orders-mobile-scroll overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[180px]">
                    Order Info
                  </th>

                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[150px]">
                    Date & Time
                  </th>

                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">
                    Items & Address
                  </th>

                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[120px]">
                    Total Bill
                  </th>

                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[220px]">
                    Status / Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      initialOrder={order}
                      activeTab={activeTab}
                      onAction={handleStatusChange}
                      onShowReceipt={setSelectedReceiptOrder}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-24 text-center text-gray-400 italic font-medium"
                    >
                      No orders found in this section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedReceiptOrder ? (
        <OrderReceiptPreview
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      ) : null}

      {/* =========================================================
          MOBILE RESPONSIVE ONLY
          Desktop is intentionally untouched.
         ========================================================= */}
      <style jsx>{`
        @media (max-width: 767px) {
          /*
           * ROOT
           */
          .orders-mobile-page {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            height: auto !important;
            min-height: calc(100vh - 100px);
            overflow: hidden;
            box-sizing: border-box;
          }

          /*
           * HEADER
           */
          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6 {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 14px;
          }

          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6
            h1 {
            font-size: 20px;
            line-height: 1.25;
          }

          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6
            button {
            width: 100%;
            min-height: 40px;
            justify-content: center;
          }

          /*
           * TABS
           *
           * Keep all four tabs in one horizontal row.
           * If they don't fit, user can swipe horizontally.
           */
          .orders-mobile-tabs {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            gap: 4px;
            margin-bottom: 14px;
            padding-bottom: 4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }

          .orders-mobile-tabs::-webkit-scrollbar {
            display: none;
          }

          .orders-mobile-tabs > button {
            flex: 0 0 auto;
            white-space: nowrap;
            padding: 10px 12px;
            font-size: 11px;
          }

          /*
           * TABLE CARD
           */
          .orders-mobile-table {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            flex: none;
            box-sizing: border-box;
            overflow: hidden;
          }

          /*
           * TABLE SCROLL AREA
           */
          .orders-mobile-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          /*
           * IMPORTANT:
           * Do NOT shrink or remove columns.
           *
           * The table keeps its complete layout and the
           * user horizontally scrolls it on mobile.
           */
          .orders-mobile-scroll table {
            min-width: 900px;
          }

          /*
           * Slightly tighter mobile cells.
           */
          .orders-mobile-scroll th,
          .orders-mobile-scroll td {
            padding: 12px;
          }
        }

        /*
         * SMALL PHONES
         */
        @media (max-width: 480px) {
          .orders-mobile-page {
            min-height: calc(100vh - 80px);
          }

          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6 {
            margin-bottom: 10px;
          }

          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6
            h1 {
            font-size: 18px;
          }

          .orders-mobile-tabs {
            margin-bottom: 10px;
          }

          .orders-mobile-tabs > button {
            padding: 9px 10px;
            font-size: 10px;
          }

          .orders-mobile-scroll table {
            min-width: 850px;
          }

          .orders-mobile-scroll th,
          .orders-mobile-scroll td {
            padding: 10px;
          }
        }

        /*
         * VERY SMALL PHONES
         */
        @media (max-width: 360px) {
          .orders-mobile-page
            > .flex.justify-between.items-center.mb-6
            h1 {
            font-size: 17px;
          }

          .orders-mobile-tabs > button {
            padding: 8px;
            font-size: 9px;
          }

          .orders-mobile-scroll table {
            min-width: 800px;
          }
        }
      `}</style>
    </>
  );
};

// --- Sub-component for individual rows with Lazy Loading ---

const TableRow = ({
  initialOrder,
  activeTab,
  onAction,
  onShowReceipt,
}: {
  initialOrder: Order;
  activeTab: OrderBoardTab;
  onAction: (
    orderId: string,
    action:
      | 'accept'
      | 'reject'
      | 'prepare'
      | 'ready'
      | 'dispatch'
      | 'complete'
  ) => void;
  onShowReceipt: (order: Order) => void;
}) => {
  const [order, setOrder] =
    useState<Order>(initialOrder);

  const [isFetching, setIsFetching] =
    useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Lazy load product details and address because summary API doesn't provide them
  useEffect(() => {
    const loadFullDetails = async () => {
      // Only fetch if items or address are missing
      if (
        !initialOrder.items ||
        initialOrder.items.length === 0 ||
        !initialOrder.address
      ) {
        setIsFetching(true);

        try {
          const detailedOrder =
            await fetchOrderById(initialOrder.id);

          setOrder(detailedOrder);
        } catch (err) {
          console.error(
            "Error fetching order details for table:",
            err
          );
        } finally {
          setIsFetching(false);
        }
      }
    };

    loadFullDetails();
  }, [initialOrder]);

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
        {/* Order Info */}
        <td className="p-4 align-top">
          <div className="font-bold text-sm text-gray-900">
            {order.orderNumber || 'N/A'}
          </div>

          <CustomerContactDisplay
            order={order}
            compact
            className="mt-1.5 text-[10px] font-black uppercase tracking-tight text-emerald-600"
          />
        </td>

        {/* Time */}
        <td className="p-4 align-top">
          <div className="text-sm font-bold text-gray-700">
            {order.createdAt
              ? formatTimeIST(order.createdAt)
              : '--:--'}
          </div>

          <div className="text-[11px] text-gray-400 font-medium">
            {order.createdAt
              ? formatDateIST(order.createdAt)
              : 'No date'}
          </div>
        </td>

        {/* Items & Address with Loading State */}
        <td className="p-4 align-top">
          {isFetching ? (
            <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black animate-pulse">
              <RotateCw
                size={10}
                className="animate-spin"
              />

              FETCHING ITEMS...
            </div>
          ) : (
            <div className="space-y-2">
              {/* Products */}
              <div className="space-y-1">
                {order.items &&
                order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <span className="font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                        {item.quantity}x
                      </span>

                      <span className="font-medium">
                        {item.productName}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ShoppingBag
                      size={14}
                      className="text-gray-400"
                    />

                    <span className="font-medium">
                      {order.itemCount} Items in Order
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <DeliveryAddressCard
                address={order.address}
                compact
                className="border-t border-gray-50 pt-1.5"
              />
            </div>
          )}
        </td>

        {/* Amount & Status Badge */}
        <td className="p-4 align-top">
          <div className="text-sm font-black text-gray-800">
            ₹{order.grandTotal}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <div
              className={`text-[10px] inline-block px-2 py-0.5 rounded font-black uppercase tracking-widest ${
                STATUS_BADGE_COLORS[
                  normalizeOrderStatus(
                    order.status
                  )
                ] ||
                'bg-gray-100 text-gray-600'
              }`}
            >
              {normalizeOrderStatus(
                order.status
              )}
            </div>

            {(order.paymentStatus === 'PAID' ||
              normalizeOrderStatus(
                order.status
              ) === ORDER_STATUS.PAID) && (
              <div className="text-[10px] inline-block rounded bg-green-100 px-2 py-0.5 font-black uppercase tracking-widest text-green-700">
                PAID
              </div>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="p-4 align-top">
          {activeTab === ORDER_STATUS.PAID &&
            normalizeOrderStatus(
              order.status
            ) === ORDER_STATUS.PAID && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onAction(
                      order.id,
                      'accept'
                    )
                  }
                  className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[10px] font-black rounded shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  ACCEPT
                </button>

                <button
                  onClick={() =>
                    onAction(
                      order.id,
                      'reject'
                    )
                  }
                  className="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black rounded hover:bg-red-50 transition-colors"
                >
                  REJECT
                </button>
              </div>
            )}

          {activeTab === ORDER_STATUS.PREPARING &&
            normalizeOrderStatus(order.status) === ORDER_STATUS.PREPARING && (
              <button
                onClick={() => onAction(order.id, 'ready')}
                className="w-full px-3 py-2.5 bg-amber-500 text-white text-[10px] font-black rounded hover:bg-amber-600 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                PREPARED
              </button>
            )}

          {activeTab === ORDER_STATUS.READY_TO_DISPATCH &&
            normalizeOrderStatus(order.status) ===
              ORDER_STATUS.READY_TO_DISPATCH && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onShowReceipt(order)}
                  className="flex flex-1 items-center justify-center gap-1 rounded bg-slate-100 px-2 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-200"
                >
                  <Receipt size={12} /> Receipt
                </button>
                <button
                  onClick={() => onAction(order.id, 'dispatch')}
                  className="flex-1 px-3 py-2.5 bg-purple-600 text-white text-[10px] font-black rounded hover:bg-purple-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  DISPATCH 🛵
                </button>
              </div>
            )}

          {activeTab === ORDER_STATUS.OUT_FOR_DELIVERY &&
            normalizeOrderStatus(order.status) ===
              ORDER_STATUS.OUT_FOR_DELIVERY && (
            <button
              onClick={() =>
                onAction(
                  order.id,
                  'complete'
                )
              }
              className="w-full px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded hover:bg-emerald-700 shadow-md transition-all"
            >
              DELIVERED
            </button>
          )}

          {activeTab === 'COMPLETED' && (
            <div className="space-y-2">
              <span className="w-full block text-center px-2 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase">
                {normalizeOrderStatus(
                  order.status
                )}
              </span>

              <button
                type="button"
                onClick={() => onShowReceipt(order)}
                className="flex w-full items-center justify-center gap-1 rounded bg-slate-100 px-2 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-200"
              >
                <Receipt size={12} /> Receipt
              </button>
            </div>
          )}
        </td>
      </tr>
  );
};