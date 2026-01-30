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
        { key: 'direction', label: 'Direction' },
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
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/contract-positions/${row.id}`;
      }}
    />
  );
}

