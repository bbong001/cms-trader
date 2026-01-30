import { useState } from 'react';
import DataTable from './DataTable';

export default function UsersTable() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (row: any) => {
    if (row.isBanned) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          Banned
        </span>
      );
    }
    if (!row.isActive) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    if (row.isVerified) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          Verified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        Unverified
      </span>
    );
  };

  const getApiUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter === 'banned') params.append('isBanned', 'true');
    else if (statusFilter === 'active') params.append('isActive', 'true');
    else if (statusFilter === 'inactive') params.append('isActive', 'false');
    else if (statusFilter === 'verified') params.append('isVerified', 'true');
    
    const queryString = params.toString();
    return `/api/users/list${queryString ? '?' + queryString : ''}`;
  };

  return (
    <div>
      {/* Status Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setStatusFilter('banned')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'banned'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Banned
        </button>
        <button
          onClick={() => setStatusFilter('verified')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'verified'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Verified
        </button>
      </div>

      <DataTable
        key={statusFilter} // Force re-render when filter changes
        title="Users"
        apiUrl={getApiUrl()}
        columns={[
          { key: 'id', label: 'ID', type: 'number' },
          { key: 'email', label: 'Email' },
          {
            key: 'status',
            label: 'Status',
            accessor: (row) => getStatusBadge(row),
          },
          {
            key: 'createdAt',
            label: 'Created At',
            type: 'date',
          },
          {
            key: 'lastLoginAt',
            label: 'Last Login',
            type: 'date',
            accessor: (row) => row.lastLoginAt || 'Never',
          },
          {
            key: 'walletsCount',
            label: 'Wallets',
            type: 'number',
            accessor: (row) => row._count?.wallets ?? 0,
          },
          {
            key: 'ordersCount',
            label: 'Orders',
            type: 'number',
            accessor: (row) => row._count?.orders ?? 0,
          },
        ]}
        onRowClick={(row) => {
          window.location.href = `/users/${row.id}`;
        }}
      />
    </div>
  );
}
