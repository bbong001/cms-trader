import { useState } from 'react';

export default function IEOProductForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      symbol: formData.get('symbol'),
      status: formData.get('status'),
      totalSupply: formData.get('totalSupply'),
      currentRaised: formData.get('currentRaised') || '0',
      pricePerToken: formData.get('pricePerToken'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
    };

    try {
      const response = await fetch('/api/ieo-products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/ieo-products';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <a href="/ieo-products" className="text-blue-600 hover:underline">← Back to IEO Products</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New IEO Product</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Product created successfully! Redirecting...
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                required
                placeholder="e.g., EBUN, ETF"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="ENDED">ENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700 mb-2">
                Total Supply *
              </label>
              <input
                type="number"
                id="totalSupply"
                name="totalSupply"
                required
                step="0.000000000000000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="currentRaised" className="block text-sm font-medium text-gray-700 mb-2">
                Current Raised
              </label>
              <input
                type="number"
                id="currentRaised"
                name="currentRaised"
                step="0.000000000000000001"
                defaultValue="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="pricePerToken" className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Token (USDT) *
              </label>
              <input
                type="number"
                id="pricePerToken"
                name="pricePerToken"
                required
                step="0.000000000000000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <a
              href="/ieo-products"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

