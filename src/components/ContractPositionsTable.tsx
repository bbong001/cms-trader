import DataTable from './DataTable';

export default function ContractPositionsTable() {
  return (
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
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${expired ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
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
  );
}

