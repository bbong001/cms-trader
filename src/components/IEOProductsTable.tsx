import DataTable from './DataTable';

export default function IEOProductsTable() {
  return (
    <DataTable
      title="IEO Products"
      apiUrl="/api/ieo-products/list"
      createUrl="/ieo-products/new"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'title', label: 'Title' },
        { key: 'symbol', label: 'Symbol' },
        { key: 'status', label: 'Status' },
        { 
          key: 'totalSupply',
          label: 'Total Supply',
          type: 'number',
          accessor: (row) => row.totalSupply?.toString() || '0',
        },
        { 
          key: 'currentRaised',
          label: 'Current Raised',
          type: 'number',
          accessor: (row) => row.currentRaised?.toString() || '0',
        },
        { 
          key: 'pricePerToken',
          label: 'Price/Token',
          type: 'number',
          accessor: (row) => row.pricePerToken?.toString() || '0',
        },
        { 
          key: 'investmentsCount',
          label: 'Investments',
          type: 'number',
          accessor: (row) => row._count?.investments ?? 0,
        },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/ieo-products/${row.id}`;
      }}
    />
  );
}

