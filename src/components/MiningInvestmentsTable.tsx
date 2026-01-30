import DataTable from './DataTable';

export default function MiningInvestmentsTable() {
  return (
    <DataTable
      title="Mining Investments"
      apiUrl="/api/mining-investments/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { 
          key: 'productHashRate',
          label: 'Product',
          accessor: (row) => row.product?.hashRate || '-',
        },
        { 
          key: 'amount',
          label: 'Amount',
          type: 'number',
          accessor: (row) => row.amount?.toString() || '0',
        },
        { 
          key: 'dailyReturn',
          label: 'Daily Return',
          type: 'number',
          accessor: (row) => row.dailyReturn?.toString() || '0',
        },
        { 
          key: 'totalReturn',
          label: 'Total Return',
          type: 'number',
          accessor: (row) => row.totalReturn?.toString() || '0',
        },
        { key: 'status', label: 'Status' },
        { 
          key: 'startDate',
          label: 'Start Date',
          type: 'date',
        },
        { 
          key: 'endDate',
          label: 'End Date',
          type: 'date',
        },
      ]}
    />
  );
}

