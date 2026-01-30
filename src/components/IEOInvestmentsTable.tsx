import DataTable from './DataTable';

export default function IEOInvestmentsTable() {
  return (
    <DataTable
      title="IEO Investments"
      apiUrl="/api/ieo-investments/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { 
          key: 'productTitle',
          label: 'Product',
          accessor: (row) => row.product?.title || '-',
        },
        { 
          key: 'amount',
          label: 'Amount',
          type: 'number',
          accessor: (row) => row.amount?.toString() || '0',
        },
        { 
          key: 'tokens',
          label: 'Tokens',
          type: 'number',
          accessor: (row) => row.tokens?.toString() || '0',
        },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/ieo-investments/${row.id}`;
      }}
    />
  );
}

