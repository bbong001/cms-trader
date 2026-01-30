import { useEffect, useState } from 'react';

interface SpotOrderDetailProps {
  orderId: string;
}

export default function SpotOrderDetail({ orderId }: SpotOrderDetailProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/spot-orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-red-600">Order not found</div>;

  const fillPercentage = order.quantity > 0 
    ? (Number(order.filledQuantity) / Number(order.quantity)) * 100 
    : 0;

  return (
    <div>
      <div className="mb-6">
        <a href="/spot-orders" className="text-blue-600 hover:underline">← Back to Spot Orders</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Spot Order Details</h1>
      
      {/* Order Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{order.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User</label>
            <p className="text-lg">
              {order.user ? (
                <a href={`/users/${order.user.id}`} className="text-blue-600 hover:underline">
                  {order.user.email}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Symbol</label>
            <p className="text-lg font-medium">{order.symbol}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Side</label>
            <p className="text-lg">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                order.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {order.side}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Type</label>
            <p className="text-lg">{order.type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Price</label>
            <p className="text-lg">
              {order.price ? Number(order.price).toLocaleString() : 'MARKET'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Quantity</label>
            <p className="text-lg">{Number(order.quantity).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Filled Quantity</label>
            <p className="text-lg">{Number(order.filledQuantity).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fill Percentage</label>
            <p className="text-lg">{fillPercentage.toFixed(2)}%</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-lg">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                order.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                order.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' :
                order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fee Asset</label>
            <p className="text-lg">{order.feeAsset || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fee Amount</label>
            <p className="text-lg">{order.feeAmount ? Number(order.feeAmount).toLocaleString() : '0'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Trade Fills */}
      {order.tradeFills && order.tradeFills.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Trade Fills ({order.tradeFills.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.tradeFills.map((fill: any) => (
                  <tr key={fill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{fill.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{Number(fill.price).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{Number(fill.quantity).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{Number(fill.feeAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(fill.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

