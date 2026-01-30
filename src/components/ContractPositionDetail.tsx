import { useEffect, useState } from 'react';

interface ContractPositionDetailProps {
  positionId: string;
}

export default function ContractPositionDetail({ positionId }: ContractPositionDetailProps) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contract-positions/${positionId}`)
      .then((res) => res.json())
      .then((data) => {
        setPosition(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [positionId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!position) return <div className="p-8 text-center text-red-600">Contract position not found</div>;

  const profitLoss = position.actualProfit != null 
    ? Number(position.actualProfit) 
    : position.exitPrice != null && position.entryPrice != null
    ? (position.direction === 'UP' 
        ? (Number(position.exitPrice) - Number(position.entryPrice)) * Number(position.amount)
        : (Number(position.entryPrice) - Number(position.exitPrice)) * Number(position.amount))
    : null;

  return (
    <div>
      <div className="mb-6">
        <a href="/contract-positions" className="text-blue-600 hover:underline">← Back to Contract Positions</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Contract Position Details</h1>
      
      {/* Position Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Position Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{position.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User</label>
            <p className="text-lg">
              {position.user ? (
                <a href={`/users/${position.user.id}`} className="text-blue-600 hover:underline">
                  {position.user.email}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Symbol</label>
            <p className="text-lg font-medium">{position.symbol}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Direction</label>
            <p className="text-lg">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                position.direction === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {position.direction}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Amount</label>
            <p className="text-lg">{Number(position.amount).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Entry Price</label>
            <p className="text-lg">{Number(position.entryPrice).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Exit Price</label>
            <p className="text-lg">
              {position.exitPrice ? Number(position.exitPrice).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-lg">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                position.status === 'CLOSED' && position.result === 'WIN' ? 'bg-green-100 text-green-800' :
                position.status === 'CLOSED' && position.result === 'LOSS' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {position.status} {position.result ? `(${position.result})` : ''}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Result</label>
            <p className="text-lg">
              {position.result ? (
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  position.result === 'WIN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {position.result}
                </span>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Actual Profit/Loss</label>
            <p className={`text-lg font-semibold ${
              profitLoss != null 
                ? profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                : ''
            }`}>
              {profitLoss != null 
                ? `${profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}`
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Expires At</label>
            <p className="text-lg">
              {position.expiresAt ? new Date(position.expiresAt).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Closed At</label>
            <p className="text-lg">
              {position.closedAt ? new Date(position.closedAt).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(position.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Position Summary */}
      {position.status === 'CLOSED' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Position Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <label className="text-sm font-medium text-gray-500">Entry Price</label>
              <p className="text-lg font-semibold">{Number(position.entryPrice).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <label className="text-sm font-medium text-gray-500">Exit Price</label>
              <p className="text-lg font-semibold">
                {position.exitPrice ? Number(position.exitPrice).toLocaleString() : '-'}
              </p>
            </div>
            <div className={`p-4 rounded ${
              profitLoss != null && profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <label className="text-sm font-medium text-gray-500">Profit/Loss</label>
              <p className={`text-lg font-semibold ${
                profitLoss != null 
                  ? profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  : ''
              }`}>
                {profitLoss != null 
                  ? `${profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}`
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

