import { useEffect, useState } from 'react';

interface TradeFillDetailProps {
  fillId: string;
}

export default function TradeFillDetail({ fillId }: TradeFillDetailProps) {
  const [fill, setFill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trade-fills/${fillId}`)
      .then((res) => res.json())
      .then((data) => {
        setFill(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [fillId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!fill) return <div className="p-8 text-center text-red-600">Trade fill not found</div>;

  const totalValue = Number(fill.price) * Number(fill.quantity);

  return (
    <div>
      <div className="mb-6">
        <a href="/trade-fills" className="text-blue-600 hover:underline">← Back to Trade Fills</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Trade Fill Details</h1>
      
      {/* Fill Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Trade Fill Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{fill.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User</label>
            <p className="text-lg">
              {fill.user ? (
                <a href={`/users/${fill.user.id}`} className="text-blue-600 hover:underline">
                  {fill.user.email}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Symbol</label>
            <p className="text-lg font-medium">{fill.symbol}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Side</label>
            <p className="text-lg">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                fill.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {fill.side}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Price</label>
            <p className="text-lg">{Number(fill.price).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Quantity</label>
            <p className="text-lg">{Number(fill.quantity).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Value</label>
            <p className="text-lg font-semibold">{totalValue.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fee Amount</label>
            <p className="text-lg">{Number(fill.feeAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Order</label>
            <p className="text-lg">
              {fill.order ? (
                <a href={`/spot-orders/${fill.order.id}`} className="text-blue-600 hover:underline">
                  Order #{fill.order.id}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(fill.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Order Details (if available) */}
      {fill.order && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Related Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Order ID</label>
              <p className="text-lg">
                <a href={`/spot-orders/${fill.order.id}`} className="text-blue-600 hover:underline">
                  #{fill.order.id}
                </a>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Type</label>
              <p className="text-lg">{fill.order.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Status</label>
              <p className="text-lg">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  fill.order.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                  fill.order.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {fill.order.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Quantity</label>
              <p className="text-lg">{Number(fill.order.quantity).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Filled Quantity</label>
              <p className="text-lg">{Number(fill.order.filledQuantity).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Price</label>
              <p className="text-lg">
                {fill.order.price ? Number(fill.order.price).toLocaleString() : 'MARKET'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

