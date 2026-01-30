import { useState } from 'react';

export default function MiningProductForm() {
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
      hashRate: formData.get('hashRate'),
      currency: formData.get('currency') || 'USDT',
      averageDailyReturn: formData.get('averageDailyReturn'),
      minimumPurchase: formData.get('minimumPurchase'),
      maximumPurchase: formData.get('maximumPurchase') || null,
      duration: formData.get('duration') || '30',
      status: formData.get('status'),
    };

    try {
      const response = await fetch('/api/mining-products/create', {
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
        window.location.href = '/mining-products';
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
        <a href="/mining-products" className="text-blue-600 hover:underline">← Back to Mining Products</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New Mining Product</h1>

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
              <label htmlFor="hashRate" className="block text-sm font-medium text-gray-700 mb-2">
                Hash Rate *
              </label>
              <input
                type="text"
                id="hashRate"
                name="hashRate"
                required
                placeholder="e.g., 180MH/S, 540MH/S"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <input
                type="text"
                id="currency"
                name="currency"
                defaultValue="USDT"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="averageDailyReturn" className="block text-sm font-medium text-gray-700 mb-2">
                Average Daily Return (%) *
              </label>
              <input
                type="number"
                id="averageDailyReturn"
                name="averageDailyReturn"
                required
                step="0.000000000000000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="minimumPurchase" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Purchase *
              </label>
              <input
                type="number"
                id="minimumPurchase"
                name="minimumPurchase"
                required
                step="0.000000000000000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maximumPurchase" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Purchase
              </label>
              <input
                type="number"
                id="maximumPurchase"
                name="maximumPurchase"
                step="0.000000000000000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                required
                defaultValue="30"
                min="1"
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
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SOLD_OUT">SOLD_OUT</option>
              </select>
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
              href="/mining-products"
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

