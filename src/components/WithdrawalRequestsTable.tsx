import DataTable from './DataTable';

export default function WithdrawalRequestsTable() {
  return (
    <DataTable
      title="Withdrawal Requests"
      apiUrl="/api/withdrawal-requests/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'asset', label: 'Asset' },
        { key: 'chain', label: 'Chain' },
        { key: 'address', label: 'Address' },
        { 
          key: 'amount',
          label: 'Amount',
          type: 'number',
          accessor: (row) => row.amount?.toString() || '0',
        },
        { 
          key: 'fee',
          label: 'Fee',
          type: 'number',
          accessor: (row) => row.fee?.toString() || '0',
        },
        { 
          key: 'arrival',
          label: 'Arrival',
          type: 'number',
          accessor: (row) => row.arrival?.toString() || '0',
        },
        { key: 'status', label: 'Status' },
        { key: 'txHash', label: 'Tx Hash' },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/withdrawal-requests/${row.id}`;
      }}
    />
  );
}

