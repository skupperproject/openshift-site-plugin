import { FC } from 'react';

import FormatOCPDateCell from '@core/components/FormatOCPDate';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { ISO8601Timestamp } from '@interfaces/CRD_Base';
import { AccessGrant } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import { Button } from '@patternfly/react-core';

import { AccessGrantCrdResponse } from '../../../interfaces/CRD_AccessGrant';

interface AccessGrantTableProps {
  grants: AccessGrant[];
  onDownloadGrant: (name: AccessGrantCrdResponse) => void;
  onDeleteGrant: (name: string) => void;
  t: (key: string) => string;
}

const AccessGrantTable: FC<AccessGrantTableProps> = function ({ grants, onDeleteGrant, onDownloadGrant, t }) {
  const columns: SKColumn<AccessGrant>[] = [
    { name: t('Name'), prop: 'name' },
    { name: t('Status'), prop: 'status', customCellName: 'StatusCell', width: 15 },
    { name: t('Message'), prop: 'statusMessage' },
    { name: t('Redemptions Allowed'), prop: 'redemptionsAllowed' },
    { name: t('Redeemed'), prop: 'redemptions' },
    { name: t('Expiration'), prop: 'expirationTime', customCellName: 'Date', modifier: 'fitContent' },
    { name: '', customCellName: 'actions', modifier: 'fitContent' }
  ];

  const customCells = {
    StatusCell,
    Date: ({ value, data: grantData }: SKComponentProps<AccessGrant>) => {
      const now = new Date();
      const ValidFor = new Date(value as ISO8601Timestamp);

      return now > ValidFor ? t('Expired') : grantData.status ? <FormatOCPDateCell value={ValidFor} /> : '';
    },
    actions: ({ data: grantData }: SKComponentProps<AccessGrant>) => (
      <>
        <Button
          onClick={() => onDownloadGrant(grantData.rawData)}
          variant="link"
          isDisabled={
            !grantData.status ||
            grantData.hasError ||
            new Date() > new Date(grantData.expirationTime as ISO8601Timestamp) ||
            (grantData.redemptions || 0) >= (grantData.redemptionsAllowed || 0)
          }
        >
          {t('Download')}
        </Button>

        <Button onClick={() => onDeleteGrant(grantData.name)} variant="link">
          {t('Delete')}
        </Button>
      </>
    )
  };

  return <SkTable columns={columns} rows={grants} customCells={customCells} alwaysShowPagination={false} isPlain />;
};

export default AccessGrantTable;
