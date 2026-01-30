import DataTable from './DataTable';

export default function TransfersTable() {
  return (
    <DataTable
      title="Transfers"
      apiUrl="/api/transfers/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'asset', label: 'Asset' },
        { 
          key: 'amount',
          label: 'Amount',
          type: 'number',
          accessor: (row) => row.amount?.toString() || '0',
        },
        { key: 'fromAccount', label: 'From' },
        { key: 'toAccount', label: 'To' },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/transfers/${row.id}`;
      }}
    />
  );
}

