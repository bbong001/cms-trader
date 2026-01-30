import DataTable from './DataTable';

export default function SpotOrdersTable() {
  return (
    <DataTable
      title="Spot Orders"
      apiUrl="/api/spot-orders/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'symbol', label: 'Symbol' },
        { key: 'side', label: 'Side' },
        { key: 'type', label: 'Type' },
        { 
          key: 'quantity',
          label: 'Quantity',
          type: 'number',
          accessor: (row) => row.quantity?.toString() || '0',
        },
        { 
          key: 'filledQuantity',
          label: 'Filled',
          type: 'number',
          accessor: (row) => row.filledQuantity?.toString() || '0',
        },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/spot-orders/${row.id}`;
      }}
    />
  );
}

