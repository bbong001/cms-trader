import DataTable from './DataTable';

export default function MiningProductsTable() {
  return (
    <DataTable
      title="Mining Products"
      apiUrl="/api/mining-products/list"
      createUrl="/mining-products/new"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'hashRate', label: 'Hash Rate' },
        { key: 'currency', label: 'Currency' },
        { 
          key: 'averageDailyReturn',
          label: 'Daily Return %',
          type: 'number',
          accessor: (row) => row.averageDailyReturn?.toString() || '0',
        },
        { 
          key: 'minimumPurchase',
          label: 'Min Purchase',
          type: 'number',
          accessor: (row) => row.minimumPurchase?.toString() || '0',
        },
        { key: 'duration', label: 'Duration (days)', type: 'number' },
        { key: 'status', label: 'Status' },
        { 
          key: 'investmentsCount',
          label: 'Investments',
          type: 'number',
          accessor: (row) => row._count?.investments ?? 0,
        },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/mining-products/${row.id}`;
      }}
    />
  );
}

