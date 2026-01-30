import { useEffect, useState } from 'react';

interface WalletDetailProps {
  walletId: string;
}

export default function WalletDetail({ walletId }: WalletDetailProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wallets/${walletId}`)
      .then((res) => res.json())
      .then((data) => {
        setWallet(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [walletId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!wallet) return <div className="p-8 text-center text-red-600">Wallet not found</div>;

  return (
    <div>
      <div className="mb-6">
        <a href="/wallets" className="text-blue-600 hover:underline">← Back to Wallets</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Wallet Details</h1>
      
      {/* Wallet Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{wallet.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User</label>
            <p className="text-lg">
              {wallet.user ? (
                <a href={`/users/${wallet.user.id}`} className="text-blue-600 hover:underline">
                  {wallet.user.email}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Asset</label>
            <p className="text-lg font-medium">{wallet.asset}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Available</label>
            <p className="text-lg">{Number(wallet.available).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Locked</label>
            <p className="text-lg">{Number(wallet.locked).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Balance</label>
            <p className="text-lg font-semibold">
              {Number(wallet.available) + Number(wallet.locked)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-lg">{new Date(wallet.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Updated At</label>
            <p className="text-lg">{new Date(wallet.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

