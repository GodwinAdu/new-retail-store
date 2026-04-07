"use client";

import { forwardRef } from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptData {
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  saleNumber?: string;
  date: Date;
  cashier?: string;
  customerName?: string;
  customerPhone?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
}

interface ThermalReceiptProps {
  data: ReceiptData;
  id?: string;
}

const LINE = "────────────────────────────────";
const DLINE = "════════════════════════════════";

function padRight(str: string, len: number) {
  return str.length > len ? str.slice(0, len - 1) + "…" : str.padEnd(len);
}

function padLeft(str: string, len: number) {
  return str.padStart(len);
}

function formatMoney(amount: number) {
  return `GH₵${amount.toFixed(2)}`;
}

const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ data, id = "receipt-print" }, ref) => {
    const COL_NAME = 20;
    const COL_AMT = 10;

    return (
      <div
        ref={ref}
        id={id}
        style={{
          width: "302px",
          maxWidth: "302px",
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          fontSize: "12px",
          lineHeight: "1.35",
          color: "#000",
          background: "#fff",
          padding: "8px 10px",
          boxSizing: "border-box",
        }}
      >
        {/* Store Header */}
        <div style={{ textAlign: "center", paddingBottom: "6px" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "2px" }}>
            {data.storeName || "QounterPay"}
          </div>
          {data.storeAddress && (
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
              {data.storeAddress}
            </div>
          )}
          {data.storePhone && (
            <div style={{ fontSize: "10px", color: "#555" }}>
              Tel: {data.storePhone}
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{DLINE}</div>

        {/* Transaction Info */}
        <div style={{ padding: "4px 0", fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Receipt:</span>
            <span style={{ fontWeight: "bold" }}>#{data.saleNumber || "N/A"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Date:</span>
            <span>{data.date.toLocaleDateString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Time:</span>
            <span>{data.date.toLocaleTimeString()}</span>
          </div>
          {data.cashier && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Cashier:</span>
              <span>{data.cashier}</span>
            </div>
          )}
          {data.customerName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Customer:</span>
              <span>{data.customerName}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{LINE}</div>

        {/* Column Headers */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            fontWeight: "bold",
            padding: "3px 0",
            borderBottom: "1px solid #ccc",
          }}
        >
          <span>ITEM</span>
          <span>QTY</span>
          <span>PRICE</span>
          <span style={{ textAlign: "right" }}>TOTAL</span>
        </div>

        {/* Items */}
        <div style={{ padding: "4px 0" }}>
          {data.items.map((item, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  paddingLeft: "8px",
                  color: "#444",
                }}
              >
                <span>{item.quantity} x {formatMoney(item.price)}</span>
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  {formatMoney(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{LINE}</div>

        {/* Totals */}
        <div style={{ padding: "4px 0", fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal:</span>
            <span>{formatMoney(data.subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Discount:</span>
              <span>-{formatMoney(data.discount)}</span>
            </div>
          )}
          {data.tax > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax:</span>
              <span>{formatMoney(data.tax)}</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{DLINE}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "16px",
            fontWeight: "bold",
            padding: "6px 0",
          }}
        >
          <span>TOTAL</span>
          <span>{formatMoney(data.total)}</span>
        </div>
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{DLINE}</div>

        {/* Payment Info */}
        <div style={{ padding: "4px 0", fontSize: "11px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Payment:</span>
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {data.paymentMethod}
            </span>
          </div>
          {data.amountPaid && data.amountPaid > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tendered:</span>
              <span>{formatMoney(data.amountPaid)}</span>
            </div>
          )}
          {data.change && data.change > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Change:</span>
              <span>{formatMoney(data.change)}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#999" }}>{LINE}</div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "6px 0 2px", fontSize: "11px" }}>
          <div style={{ fontWeight: "bold" }}>Thank you for your purchase!</div>
          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
            Goods sold are not returnable
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            Please keep this receipt for your records
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "10px", color: "#999", marginTop: "4px" }}>
          {LINE}
        </div>

        <div style={{ textAlign: "center", fontSize: "9px", color: "#aaa", padding: "4px 0" }}>
          Powered by QounterPay
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = "ThermalReceipt";

export default ThermalReceipt;
export type { ReceiptData, ReceiptItem };
