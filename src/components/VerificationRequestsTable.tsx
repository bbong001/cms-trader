import { useState, useEffect } from 'react';
import DataTable from './DataTable';

interface VerificationRequest {
  id: number;
  userId: number;
  name: string;
  idNumber: string;
  frontIdUrl: string;
  backIdUrl: string;
  status: string;
  rejectReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: number;
    email: string;
    isVerified: boolean;
  };
}

export default function VerificationRequestsTable() {
  const [statusFilter, setStatusFilter] = useState('PENDING');

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verification Requests</h1>
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
        apiUrl={`/api/verification-requests/list?status=${statusFilter}`}
        columns={[
          { key: 'id', label: 'ID', type: 'number', sortable: true },
          {
            key: 'user.email',
            label: 'User Email',
            accessor: (row: VerificationRequest) => row.user?.email || 'N/A',
            sortable: true,
            searchable: true,
          },
          { key: 'name', label: 'Name', sortable: true, searchable: true },
          { key: 'idNumber', label: 'ID Number', sortable: true, searchable: true },
          {
            key: 'status',
            label: 'Status',
            type: 'string',
            sortable: true,
            render: (value: any, row: VerificationRequest) => {
              const status = row?.status || value || 'UNKNOWN';
              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-500',
                APPROVED: 'bg-green-500',
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
          {
            key: 'reviewedAt',
            label: 'Reviewed At',
            type: 'date',
            sortable: true,
            accessor: (row: VerificationRequest) => row.reviewedAt || null,
          },
        ]}
        onRowClick={(row: VerificationRequest) => {
          window.location.href = `/verification-requests/${row.id}`;
        }}
      />
    </div>
  );
}

