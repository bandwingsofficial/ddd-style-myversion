'use client';

import React, { useEffect, useState } from 'react';
import { Search, X, ShoppingBag, RotateCw } from 'lucide-react';

import { useOrderHistory } from '../hooks/useOrderHistory';
import { fetchOrderById } from '../api/orders';
import { Order } from '../types';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';
import { CustomerContactDisplay } from '@/features/orders/components/CustomerContactDisplay';
import { DeliveryAddressCard } from '@/features/orders/components/DeliveryAddressCard';
import { OrderReceiptPreview } from '@/features/orders/components/OrderReceiptPreview';
import {
  normalizeOrderStatus,
  ORDER_STATUS,
  OUTLET_ORDER_STATUS_FILTER_OPTIONS,
  STATUS_BADGE_COLORS,
} from '../utils/order-status.util';

export const OrderHistory = () => {
  const {
    orders,
    loading,
    page,
    total,
    totalPages,
    search,
    status,
    fromDate,
    toDate,
    filtersActive,
    setPage,
    setSearch,
    setStatus,
    setFromDate,
    setToDate,
    resetFilters,
    refresh,
  } = useOrderHistory();

  const pageStats = {
    revenue: orders.reduce((sum, order) => {
      return normalizeOrderStatus(order.status) === ORDER_STATUS.DELIVERED
        ? sum + (order.grandTotal || 0)
        : sum;
    }, 0),

    deliveredCount: orders.filter(
      (order) =>
        normalizeOrderStatus(order.status) === ORDER_STATUS.DELIVERED,
    ).length,
  };

  return (
    <>
      <div className="order-history-page flex flex-col gap-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="order-history-header flex justify-between items-end border-b border-gray-100 pb-4">
          <div className="order-history-heading">
            <h1 className="text-2xl font-bold text-gray-800">
              Order History
            </h1>

            <p className="text-sm text-gray-500">
              Comprehensive log of all store transactions
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="order-history-refresh flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all"
          >
            <RotateCw size={16} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="order-history-stats grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="order-history-stat-card bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
              Matching Orders
            </p>

            <p className="text-3xl font-black text-gray-900">
              {total}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Filtered result count
            </p>
          </div>

          <div className="order-history-stat-card bg-white p-5 border border-gray-200 rounded-xl shadow-sm border-t-4 border-t-emerald-500">
            <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mb-1">
              Delivered Revenue
            </p>

            <p className="text-3xl font-black text-emerald-600">
              ₹{pageStats.revenue.toLocaleString('en-IN')}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              On this page
            </p>
          </div>

          <div className="order-history-stat-card bg-white p-5 border border-gray-200 rounded-xl shadow-sm border-t-4 border-t-blue-500">
            <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mb-1">
              Delivered
            </p>

            <p className="text-3xl font-black text-blue-600">
              {pageStats.deliveredCount}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              On this page
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="order-history-filters bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-wrap gap-4 items-end shadow-inner">
          {/* Search */}
          <div className="order-history-search flex-1 min-w-[260px] relative">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">
              Universal Search
            </label>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search order, customer, phone..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {/* From Date */}
          <div className="order-history-date-from w-[160px]">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm"
            />
          </div>

          {/* To Date */}
          <div className="order-history-date-to w-[160px]">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm"
            />
          </div>

          {/* Status */}
          <div className="order-history-status w-[180px]">
            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">
              Status Filter
            </label>

            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer hover:border-gray-300 shadow-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>

              {OUTLET_ORDER_STATUS_FILTER_OPTIONS.filter(
                (option) => option.value !== 'ALL',
              ).map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={resetFilters}
            className="order-history-reset px-4 py-2.5 text-xs text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
          >
            Reset All
          </button>
        </div>

        {/* Table */}
        <div className="order-history-table bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="order-history-table-scroll overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    Order Reference
                  </th>

                  <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>

                  <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                    Order Details
                  </th>

                  <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">
                    Grand Total
                  </th>

                  <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">
                    Final Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-20 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <RotateCw
                          className="animate-spin text-emerald-500"
                          size={32}
                        />

                        <p className="italic animate-pulse">
                          Gathering history records...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <HistoryRow
                      key={order.id}
                      initialOrder={order}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-24 text-center text-gray-400 italic"
                    >
                      {filtersActive
                        ? 'No history found matching the selected filters.'
                        : 'No history found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="order-history-pagination flex items-center justify-between pb-10">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage(Math.max(1, page - 1))
            }
            className="order-history-pagination-button rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Previous
          </button>

          <span className="order-history-page-number text-sm text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            disabled={
              page >= totalPages ||
              loading ||
              totalPages === 0
            }
            onClick={() => setPage(page + 1)}
            className="order-history-pagination-button rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE ONLY
          Desktop layout remains untouched.
         ========================================================= */}
      <style jsx>{`
        @media (max-width: 767px) {
          /* -----------------------------------------------------
             PAGE
             ----------------------------------------------------- */
          .order-history-page {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            gap: 14px !important;
            overflow: hidden;
            box-sizing: border-box;
          }

          /* -----------------------------------------------------
             HEADER
             ----------------------------------------------------- */
          .order-history-header {
            width: 100%;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
            padding-bottom: 12px !important;
          }

          .order-history-heading {
            min-width: 0;
          }

          .order-history-heading h1 {
            font-size: 21px;
            line-height: 1.25;
          }

          .order-history-heading p {
            font-size: 12px;
            line-height: 1.5;
            margin-top: 4px;
          }

          .order-history-refresh {
            width: 100%;
            min-height: 42px;
            justify-content: center;
          }

          /* -----------------------------------------------------
             THREE SUMMARY CARDS IN ONE ROW
             ----------------------------------------------------- */
          .order-history-stats {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 7px !important;
            width: 100%;
          }

          .order-history-stat-card {
            min-width: 0;
            padding: 11px 8px !important;
            border-radius: 10px !important;
            overflow: hidden;
          }

          .order-history-stat-card p:first-child {
            font-size: 7px !important;
            line-height: 1.25;
            letter-spacing: 0.05em;
            white-space: normal;
            word-break: break-word;
          }

          .order-history-stat-card p:nth-child(2) {
            font-size: 19px !important;
            line-height: 1.2;
            margin-top: 3px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .order-history-stat-card p:last-child {
            font-size: 8px !important;
            line-height: 1.3;
            margin-top: 4px !important;
            white-space: nowrap;
          }

          /* -----------------------------------------------------
             FILTER CONTAINER
             ----------------------------------------------------- */
          .order-history-filters {
            width: 100%;
            box-sizing: border-box;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px !important;
            padding: 12px !important;
            border-radius: 14px !important;
            align-items: end !important;
          }

          /* -----------------------------------------------------
             SEARCH FULL WIDTH
             ----------------------------------------------------- */
          .order-history-search {
            grid-column: 1 / -1;
            width: 100%;
            min-width: 0 !important;
          }

          .order-history-search input {
            min-height: 42px;
            box-sizing: border-box;
          }

          /* -----------------------------------------------------
             DATE FILTERS
             FROM + TO = TWO COLUMNS
             ----------------------------------------------------- */
          .order-history-date-from,
          .order-history-date-to {
            width: 100% !important;
            min-width: 0 !important;
          }

          .order-history-date-from input,
          .order-history-date-to input {
            width: 100%;
            min-width: 0;
            min-height: 42px;
            box-sizing: border-box;
            padding-left: 8px !important;
            padding-right: 6px !important;
            font-size: 12px !important;
          }

          /* -----------------------------------------------------
             STATUS + RESET
             ----------------------------------------------------- */
          .order-history-status {
            width: 100% !important;
            min-width: 0 !important;
          }

          .order-history-status select {
            width: 100%;
            min-height: 42px;
            padding-left: 8px !important;
            padding-right: 6px !important;
            font-size: 12px !important;
            box-sizing: border-box;
          }

          .order-history-reset {
            width: 100%;
            min-height: 42px;
            padding: 10px !important;
            border: 1px solid #fee2e2;
            background: #fff;
            text-align: center;
          }

          /* -----------------------------------------------------
             TABLE
             Keep complete table, allow horizontal swipe.
             Nothing is deleted or collapsed.
             ----------------------------------------------------- */
          .order-history-table {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            border-radius: 14px !important;
            overflow: hidden;
          }

          .order-history-table-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: auto !important;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }

          .order-history-table-scroll table {
            min-width: 850px;
          }

          /* -----------------------------------------------------
             PAGINATION
             ----------------------------------------------------- */
          .order-history-pagination {
            width: 100%;
            gap: 8px;
            padding-bottom: 16px !important;
          }

          .order-history-pagination-button {
            flex: 0 0 auto;
            min-height: 40px;
            padding: 9px 13px !important;
            font-size: 12px !important;
          }

          .order-history-page-number {
            text-align: center;
            white-space: nowrap;
            font-size: 11px !important;
          }
        }

        /* ---------------------------------------------------------
           SMALL PHONES
           --------------------------------------------------------- */
        @media (max-width: 480px) {
          .order-history-page {
            gap: 12px !important;
          }

          .order-history-heading h1 {
            font-size: 19px;
          }

          .order-history-heading p {
            font-size: 11px;
          }

          .order-history-stat-card {
            padding: 10px 6px !important;
          }

          .order-history-stat-card p:first-child {
            font-size: 6.5px !important;
          }

          .order-history-stat-card p:nth-child(2) {
            font-size: 17px !important;
          }

          .order-history-stat-card p:last-child {
            font-size: 7px !important;
          }

          .order-history-filters {
            padding: 10px !important;
            gap: 8px !important;
          }

          .order-history-search input,
          .order-history-date-from input,
          .order-history-date-to input,
          .order-history-status select {
            min-height: 40px;
          }

          .order-history-table-scroll table {
            min-width: 820px;
          }
        }

        /* ---------------------------------------------------------
           VERY SMALL PHONES
           --------------------------------------------------------- */
        @media (max-width: 360px) {
          .order-history-stat-card {
            padding: 9px 5px !important;
          }

          .order-history-stat-card p:first-child {
            font-size: 6px !important;
          }

          .order-history-stat-card p:nth-child(2) {
            font-size: 15px !important;
          }

          .order-history-stat-card p:last-child {
            font-size: 6.5px !important;
          }

          .order-history-filters {
            gap: 7px !important;
          }

          .order-history-table-scroll table {
            min-width: 780px;
          }

          .order-history-pagination-button {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .order-history-page-number {
            font-size: 10px !important;
          }
        }
      `}</style>
    </>
  );
};

const HistoryRow = ({
  initialOrder,
}: {
  initialOrder: Order;
}) => {
  const [order, setOrder] =
    useState<Order>(initialOrder);

  const [isFetching, setIsFetching] =
    useState(false);

  const [showReceipt, setShowReceipt] =
    useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    const loadFullDetails = async () => {
      if (!initialOrder.items || !initialOrder.address) {
        setIsFetching(true);

        try {
          const detailedOrder =
            await fetchOrderById(initialOrder.id);

          setOrder(detailedOrder);
        } catch (err) {
          console.error(
            'Error fetching order details',
            err,
          );
        } finally {
          setIsFetching(false);
        }
      }
    };

    void loadFullDetails();
  }, [initialOrder]);

  const statusColors = STATUS_BADGE_COLORS;

  return (
    <>
      <tr className="hover:bg-emerald-50/20 transition-colors group">
        <td className="p-4">
          <div className="font-bold text-sm text-gray-900">
            {order.orderNumber}
          </div>

          <CustomerContactDisplay
            order={order}
            compact
            className="mt-1 text-[10px] font-bold uppercase tracking-tight text-emerald-600"
          />
        </td>

        <td className="p-4">
          <div className="text-sm font-medium text-gray-700">
            {formatDateIST(order.createdAt)}
          </div>

          <div className="text-[11px] text-gray-400">
            {formatTimeIST(order.createdAt)}
          </div>
        </td>

        <td className="p-4 max-w-[350px]">
          {isFetching ? (
            <div className="flex items-center gap-2 text-[10px] text-blue-500 font-bold animate-pulse">
              <RotateCw
                size={10}
                className="animate-spin"
              />

              FETCHING DETAILS...
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 mb-1">
                <ShoppingBag
                  size={14}
                  className="text-gray-400 shrink-0 mt-0.5"
                />

                <div className="text-xs text-gray-700 font-medium line-clamp-1">
                  {order.items
                    ?.map(
                      (i) =>
                        `${i.quantity}x ${i.productName}`,
                    )
                    .join(', ') ||
                    `${order.itemCount} Items`}
                </div>
              </div>

              {order.address ? (
                <DeliveryAddressCard
                  address={order.address}
                  compact
                  className="mt-1"
                />
              ) : null}
            </>
          )}
        </td>

        <td className="p-4 text-right">
          <div className="text-sm font-black text-gray-900">
            ₹{order.grandTotal.toLocaleString('en-IN')}
          </div>

          <div className="text-[10px] text-gray-400">
            Total Bill
          </div>
        </td>

        <td className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight shadow-sm ${
                statusColors[
                  normalizeOrderStatus(order.status)
                ] ||
                'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {order.status}
            </span>

            <button
              type="button"
              onClick={() => setShowReceipt(true)}
              className="text-[10px] font-black uppercase tracking-wide text-slate-500 hover:text-emerald-600"
            >
              Receipt
            </button>
          </div>
        </td>
      </tr>

      {showReceipt ? (
        <OrderReceiptPreview
          order={order}
          onClose={() =>
            setShowReceipt(false)
          }
        />
      ) : null}
    </>
  );
};