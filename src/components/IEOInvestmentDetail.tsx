import { useEffect, useState } from 'react';

interface IEOInvestmentDetailProps {
  investmentId: string;
}

export default function IEOInvestmentDetail({ investmentId }: IEOInvestmentDetailProps) {
  const [investment, setInvestment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/ieo-investments/${investmentId}`)
      .then((res) => res.json())
      .then((data) => {
        setInvestment(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [investmentId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: formData.get('amount'),
      tokens: formData.get('tokens'),
      status: formData.get('status'),
    };

    try {
      const response = await fetch(`/api/ieo-investments/${investmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update investment');
      }

      setInvestment(result.data);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!investment) return <div className="p-8 text-center text-red-600">Investment not found</div>;

  return (
    <div>
      <div className="mb-6">
        <a href="/ieo-investments" className="text-blue-600 hover:underline">← Back to IEO Investments</a>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">IEO Investment Details</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Investment updated successfully!
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDT) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  defaultValue={investment.amount.toString()}
                  required
                  step="0.000000000000000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="tokens" className="block text-sm font-medium text-gray-700 mb-2">
                  Tokens *
                </label>
                <input
                  type="number"
                  id="tokens"
                  name="tokens"
                  defaultValue={investment.tokens.toString()}
                  required
                  step="0.000000000000000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={investment.status}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Investment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">ID</label>
              <p className="text-lg">{investment.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User</label>
              <p className="text-lg">
                {investment.user ? (
                  <a href={`/users/${investment.user.id}`} className="text-blue-600 hover:underline">
                    {investment.user.email}
                  </a>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Product</label>
              <p className="text-lg">
                {investment.product ? (
                  <a href={`/ieo-products/${investment.product.id}`} className="text-blue-600 hover:underline">
                    {investment.product.title} ({investment.product.symbol})
                  </a>
                ) : (
                  '-'
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Amount (USDT)</label>
              <p className="text-lg">{Number(investment.amount).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tokens</label>
              <p className="text-lg">{Number(investment.tokens).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  investment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  investment.status === 'REFUNDED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {investment.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(investment.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(investment.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

