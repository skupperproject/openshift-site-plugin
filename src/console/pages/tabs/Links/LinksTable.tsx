import { FC } from 'react';

import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { Link } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import { Button } from '@patternfly/react-core';

interface LinksTableProps {
  links: Link[];
  onDeleteLink: (name: string) => void;
  t: (key: string) => string;
}

export const LinksTable: FC<LinksTableProps> = function ({ links, onDeleteLink, t }) {
  const columns: SKColumn<Link>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell',
      width: 15
    },
    {
      name: t('Message'),
      prop: 'statusMessage'
    },
    {
      name: t('Linked to'),
      prop: 'connectedTo'
    },
    {
      name: t('Cost'),
      prop: 'cost'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const customCells = {
    StatusCell,
    actions: ({ data }: SKComponentProps<Link>) => (
      <Button onClick={() => onDeleteLink(data.name)} variant="link">
        {t('Delete')}
      </Button>
    )
  };

  return <SkTable columns={columns} rows={links} customCells={customCells} alwaysShowPagination={false} isPlain />;
};

interface RemoteLinksTableProps {
  links: { connectedTo: string | null }[];
  t: (key: string) => string;
}

export const RemoteLinksTable: FC<RemoteLinksTableProps> = function ({ links, t }) {
  const columns: SKColumn<{ connectedTo: string | null }>[] = [
    {
      name: t('Linked to'),
      prop: 'connectedTo'
    }
  ];

  return <SkTable columns={columns} rows={links} alwaysShowPagination={false} isPlain />;
};
