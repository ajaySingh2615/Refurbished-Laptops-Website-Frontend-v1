import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';

export default function OrderPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.request(`/api/orders/${id}`);
        if (!res.success) throw new Error(res.message || 'Failed to load');
        setData(res.data);
      } catch (e) {
        setError(e.message || 'Failed to load order');
      }
    })();
  }, [id]);

  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-4xl mx-auto p-6">Loading…</div>;

  const { order, items, billing, shipping } = data;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="text-xs text-gray-600">
              Status: {order.status} | Payment: {order.paymentStatus}
            </div>
          </div>
        </div>
        <div className="border p-4 rounded space-y-3">
          <h2 className="font-semibold">Addresses</h2>
          {billing && (
            <div className="text-sm">
              <div className="font-medium">Billing</div>
              <div>{billing.name}</div>
              <div>
                {billing.line1}
                {billing.line2 ? `, ${billing.line2}` : ''}
              </div>
              <div>
                {billing.city}, {billing.state} {billing.postcode}
              </div>
              <div>{billing.country}</div>
            </div>
          )}
          {shipping && (
            <div className="text-sm">
              <div className="font-medium">Shipping</div>
              <div>{shipping.name}</div>
              <div>
                {shipping.line1}
                {shipping.line2 ? `, ${shipping.line2}` : ''}
              </div>
              <div>
                {shipping.city}, {shipping.state} {shipping.postcode}
              </div>
              <div>{shipping.country}</div>
            </div>
          )}
        </div>
      </div>
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="py-2">{it.title || `#${it.productId}`}</td>
                <td>{it.quantity}</td>
                <td>{formatPrice(it.unitPrice)}</td>
                <td>{formatPrice(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
