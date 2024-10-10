import { FC } from 'react';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Form/form';

export const TooltipInfoButton: FC<{ content: string }> = function ({ content }) {
  return (
    <Popover bodyContent={content}>
      <button
        tabIndex={-1}
        type="button"
        onClick={(e) => e.preventDefault()}
        className={styles.formGroupLabelHelp}
        aria-describedby={`${content}`}
      >
        <HelpIcon />
      </button>
    </Popover>
  );
};
