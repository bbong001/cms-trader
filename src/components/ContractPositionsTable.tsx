import { useEffect, useState } from 'react';
import DataTable from './DataTable';

interface SessionControlConfig {
  id: number;
  final: 'WIN' | 'LOSS';
  required: boolean;
  createdAt: string;
}

export default function ContractPositionsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionQueue, setSessionQueue] = useState<SessionControlConfig[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSessionConfigs = async () => {
    try {
      setLoadingConfig(true);
      setError(null);
      const res = await fetch('/api/contract-positions/session-control');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không lấy được cấu hình phiên');
      }
      setSessionQueue(data.data || []);
    } catch (err: any) {
      console.error('Fetch session control error:', err);
      setError(err.message || 'Không lấy được cấu hình phiên');
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchSessionConfigs();
    }
  }, [isModalOpen]);

  // mode = 'reset' cho nút 100% WIN/LOSS, 'append' cho thêm từng ván
  const handleSetSessionControl = async (final: 'WIN' | 'LOSS', mode: 'reset' | 'append') => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const res = await fetch('/api/contract-positions/session-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final, required: true, mode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không lưu được cấu hình phiên');
      }
      const newQueue: SessionControlConfig[] = data.data || [];
      setSessionQueue(newQueue);

      if (mode === 'reset') {
        const msg =
          final === 'WIN'
            ? 'Đã đặt lại: Phiên tiếp theo 100% WIN'
            : 'Đã đặt lại: Phiên tiếp theo 100% LOSS';
        setSuccessMessage(msg);
      } else {
        const index = newQueue.length;
        const msg =
          final === 'WIN'
            ? `Đã thêm: Ván ${index} = WIN`
            : `Đã thêm: Ván ${index} = LOSS`;
        setSuccessMessage(msg);
      }
    } catch (err: any) {
      console.error('Set session control error:', err);
      setError(err.message || 'Không lưu được cấu hình phiên');
    } finally {
      setSaving(false);
    }
  };

  const currentStatusLabel = () => {
    if (!sessionQueue || sessionQueue.length === 0) {
      return 'Hiện không có cấu hình phiên, hệ thống đang chạy mặc định.';
    }
    const total = sessionQueue.length;
    const first = sessionQueue[0];
    return `Đang cấu hình ${total} phiên tiếp theo. Ván 1: ${first.final}${
      total > 1 ? ', các ván sau xem bảng bên dưới.' : ''
    }`;
  };

  return (
    <div>
      {/* Header với nút điều khiển phiên */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Contract Positions</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow"
        >
          Điều khiển kết quả phiên
        </button>
      </div>

      <DataTable
        title="Contract Positions"
        apiUrl="/api/contract-positions/list"
        columns={[
          { key: 'id', label: 'ID', type: 'number' },
          {
            key: 'userEmail',
            label: 'User',
            accessor: (row) => row.user?.email || '-',
          },
          { key: 'symbol', label: 'Symbol' },
          {
            key: 'side',
            label: 'Direction',
            accessor: (row) => (row.side === 'BUY_UP' ? 'UP' : 'DOWN'),
          },
          {
            key: 'entryPrice',
            label: 'Entry Price',
            type: 'number',
            accessor: (row) => row.entryPrice?.toString() || '0',
          },
          {
            key: 'amount',
            label: 'Amount',
            type: 'number',
            accessor: (row) => row.amount?.toString() || '0',
          },
          { key: 'status', label: 'Status' },
          { key: 'result', label: 'Result' },
          {
            key: 'expired',
            label: 'Đã hết hạn',
            accessor: (row) => {
              if (!row.expiresAt) return '-';
              return new Date(row.expiresAt) <= new Date() ? 'Có' : 'Chưa';
            },
            render: (value, row) => {
              if (!row.expiresAt) return '-';
              const expired = new Date(row.expiresAt) <= new Date();
              return (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    expired ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {expired ? 'Có' : 'Chưa'}
                </span>
              );
            },
          },
          { key: 'createdAt', label: 'Created At', type: 'date' },
        ]}
        onRowClick={(row) => {
          window.location.href = `/contract-positions/${row.id}`;
        }}
      />

      {/* Modal điều khiển phiên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-3">Điều khiển kết quả theo phiên</h2>
            <p className="text-sm text-gray-600 mb-3">
              Dùng chức năng này để ép kết quả cho <span className="font-semibold">phiên tiếp theo</span>.
              Sau khi phiên đó kết thúc, hệ thống có thể reset cấu hình này về mặc định.
            </p>

            {loadingConfig ? (
              <p className="text-sm text-gray-500 mb-4">Đang tải cấu hình...</p>
            ) : (
              <p className="text-sm text-gray-800 mb-4">{currentStatusLabel()}</p>
            )}

            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-3 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded">
                {successMessage}
              </div>
            )}

            {/* Nút nhanh: reset và ép 100% WIN/LOSS cho phiên tiếp theo */}
            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={() => handleSetSessionControl('WIN', 'reset')}
                disabled={saving}
                className="w-full px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Phiên tiếp theo 100% WIN'}
              </button>

              <button
                type="button"
                onClick={() => handleSetSessionControl('LOSS', 'reset')}
                disabled={saving}
                className="w-full px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Phiên tiếp theo 100% LOSS'}
              </button>
            </div>

            {/* Bảng cấu hình các phiên trong hàng đợi */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Danh sách phiên đã cấu hình</h3>
              {loadingConfig ? (
                <p className="text-xs text-gray-500">Đang tải...</p>
              ) : !sessionQueue || sessionQueue.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Chưa có phiên nào trong hàng đợi. Hệ thống sẽ chạy theo kết quả mặc định.
                </p>
              ) : (
                <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Ván</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Kết quả</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Tạo lúc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionQueue.map((cfg, idx) => (
                        <tr key={cfg.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-800">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                cfg.final === 'WIN'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {cfg.final}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {new Date(cfg.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Thêm phiên thủ công */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Thêm phiên thủ công</h3>
              <p className="text-xs text-gray-600 mb-2">
                Ví dụ: ván 1 thua, ván 2 thắng, ván 3 thua... Mỗi lần bấm sẽ thêm 1 ván vào <strong>cuối hàng đợi</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSetSessionControl('LOSS', 'append')}
                  disabled={saving}
                  className="flex-1 px-3 py-2 rounded-md bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : 'Thêm ván THUA'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSessionControl('WIN', 'append')}
                  disabled={saving}
                  className="flex-1 px-3 py-2 rounded-md bg-green-500 text-white text-xs font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : 'Thêm ván THẮNG'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

