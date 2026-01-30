import DataTable from './DataTable';

export default function TradeFillsTable() {
  return (
    <DataTable
      title="Trade Fills"
      apiUrl="/api/trade-fills/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'symbol', label: 'Symbol' },
        { key: 'side', label: 'Side' },
        { 
          key: 'price',
          label: 'Price',
          type: 'number',
          accessor: (row) => row.price?.toString() || '0',
        },
        { 
          key: 'quantity',
          label: 'Quantity',
          type: 'number',
          accessor: (row) => row.quantity?.toString() || '0',
        },
        { 
          key: 'feeAmount',
          label: 'Fee',
          type: 'number',
          accessor: (row) => row.feeAmount?.toString() || '0',
        },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/trade-fills/${row.id}`;
      }}
    />
  );
}

