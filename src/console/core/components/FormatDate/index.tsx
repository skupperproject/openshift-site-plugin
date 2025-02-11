import { ReactNode } from 'react';

import { formatOCPDate } from '@core/utils/formatOCPDate';
import { ISO8601Timestamp } from '@interfaces/CRD_Base';
import { Icon } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

interface FormatOCPDateProps {
  value?: ReactNode | Date;
}

const FormatDateCell = function ({ value }: FormatOCPDateProps) {
  if (!value) {
    return null;
  }

  return (
    <>
      <Icon size="md" isInline>
        <GlobeAmericasIcon />
      </Icon>{' '}
      {formatOCPDate(value as ISO8601Timestamp)}
    </>
  );
};

export default FormatDateCell;
