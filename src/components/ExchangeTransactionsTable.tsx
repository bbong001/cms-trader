import DataTable from './DataTable';

export default function ExchangeTransactionsTable() {
  return (
    <DataTable
      title="Exchange Transactions"
      apiUrl="/api/exchange-transactions/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'fromAsset', label: 'From Asset' },
        { key: 'toAsset', label: 'To Asset' },
        { 
          key: 'fromAmount',
          label: 'From Amount',
          type: 'number',
          accessor: (row) => row.fromAmount?.toString() || '0',
        },
        { 
          key: 'toAmount',
          label: 'To Amount',
          type: 'number',
          accessor: (row) => row.toAmount?.toString() || '0',
        },
        { 
          key: 'rate',
          label: 'Rate',
          type: 'number',
          accessor: (row) => row.rate?.toString() || '0',
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
        window.location.href = `/exchange-transactions/${row.id}`;
      }}
    />
  );
}

