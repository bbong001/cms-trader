import { useState } from 'react';
import DataTable from './DataTable';

interface DepositRequest {
  id: number;
  userId: number;
  asset: string;
  network: string;
  amount: string;
  certificateUrl: string | null;
  status: string;
  rejectReason: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  txHash: string | null;
  createdAt: string;
  user: {
    id: number;
    email: string;
  };
}

export default function DepositRequestsTable() {
  const [statusFilter, setStatusFilter] = useState('PENDING');

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deposit Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'APPROVED' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'COMPLETED' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'REJECTED' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <DataTable
        title=""
        apiUrl={`/api/deposit-requests/list?status=${statusFilter}`}
        columns={[
          { key: 'id', label: 'ID', type: 'number', sortable: true },
          {
            key: 'user.email',
            label: 'User Email',
            accessor: (row: DepositRequest) => row.user?.email || 'N/A',
            sortable: true,
            searchable: true,
          },
          { key: 'asset', label: 'Asset', sortable: true, searchable: true },
          { key: 'network', label: 'Network', sortable: true, searchable: true },
          {
            key: 'amount',
            label: 'Amount',
            type: 'number',
            sortable: true,
            render: (value: any) => {
              return typeof value === 'string' ? parseFloat(value).toLocaleString() : value?.toLocaleString() || '0';
            },
          },
          {
            key: 'status',
            label: 'Status',
            type: 'string',
            sortable: true,
            render: (value: any, row: DepositRequest) => {
              const status = row?.status || value || 'UNKNOWN';
              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-500',
                APPROVED: 'bg-blue-500',
                COMPLETED: 'bg-green-500',
                REJECTED: 'bg-red-500',
              };
              return (
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    statusColors[status] || 'bg-gray-500'
                  }`}
                >
                  {status}
                </span>
              );
            },
          },
          {
            key: 'createdAt',
            label: 'Created At',
            type: 'date',
            sortable: true,
          },
        ]}
        onRowClick={(row: DepositRequest) => {
          window.location.href = `/deposit-requests/${row.id}`;
        }}
      />
    </div>
  );
}

