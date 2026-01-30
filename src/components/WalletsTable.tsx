import DataTable from './DataTable';

export default function WalletsTable() {
  return (
    <DataTable
      title="Wallets"
      apiUrl="/api/wallets/list"
      columns={[
        { key: 'id', label: 'ID', type: 'number' },
        { 
          key: 'userEmail',
          label: 'User',
          accessor: (row) => row.user?.email || '-',
        },
        { key: 'asset', label: 'Asset' },
        { 
          key: 'available',
          label: 'Available',
          type: 'number',
          accessor: (row) => row.available?.toString() || '0',
        },
        { 
          key: 'locked',
          label: 'Locked',
          type: 'number',
          accessor: (row) => row.locked?.toString() || '0',
        },
        { key: 'createdAt', label: 'Created At', type: 'date' },
      ]}
      onRowClick={(row) => {
        window.location.href = `/wallets/${row.id}`;
      }}
    />
  );
}

