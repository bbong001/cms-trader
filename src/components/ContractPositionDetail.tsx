import { useEffect, useState } from 'react';

interface ContractPositionDetailProps {
  positionId: string;
}

function fetchPosition(positionId: string) {
  return fetch(`/api/contract-positions/${positionId}`)
    .then((res) => res.json())
    .then((data) => data.data);
}

export default function ContractPositionDetail({ positionId }: ContractPositionDetailProps) {
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editResult, setEditResult] = useState<'WIN' | 'LOSS'>('WIN');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosition(positionId)
      .then((data) => {
        setPosition(data);
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
      ? (position.side === 'BUY_UP'
          ? (Number(position.exitPrice) - Number(position.entryPrice)) * Number(position.amount)
          : (Number(position.entryPrice) - Number(position.exitPrice)) * Number(position.amount))
      : null;

  const expiresAt = position.expiresAt ? new Date(position.expiresAt) : null;
  const isExpired = expiresAt != null && expiresAt <= new Date();
  const canEditWinLoss = position.status === 'OPEN' && !isExpired;

  const handleSaveWinLoss = async () => {
    if (!position || !canEditWinLoss) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/contract-positions/${positionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: editResult }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Có lỗi');
        return;
      }
      const updated = await fetchPosition(positionId);
      setPosition(updated);
    } catch (err: any) {
      setSaveError(err.message || 'Có lỗi');
    } finally {
      setSaving(false);
    }
  };

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
                position.side === 'BUY_UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {position.side === 'BUY_UP' ? 'UP' : 'DOWN'}
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
            <p className="text-lg flex items-center gap-2">
              {position.expiresAt ? new Date(position.expiresAt).toLocaleString() : '-'}
              {isExpired ? (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">Đã hết hạn</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Chưa hết hạn</span>
              )}
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

      {/* Chỉnh Win/Loss - chỉ khi chưa hết hạn */}
      {position.status === 'OPEN' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Chỉnh Win / Loss</h2>
          {isExpired ? (
            <p className="text-gray-500">Đã hết hạn, không thể chỉnh kết quả.</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Win = ăn đúng số tiền đặt (profit = amount). Loss = thua hết số tiền đặt.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="result"
                    checked={editResult === 'WIN'}
                    onChange={() => setEditResult('WIN')}
                    className="w-4 h-4"
                  />
                  <span className="text-green-700 font-medium">WIN</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="result"
                    checked={editResult === 'LOSS'}
                    onChange={() => setEditResult('LOSS')}
                    className="w-4 h-4"
                  />
                  <span className="text-red-700 font-medium">LOSS</span>
                </label>
                <button
                  type="button"
                  onClick={handleSaveWinLoss}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
              {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
            </>
          )}
        </div>
      )}

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

