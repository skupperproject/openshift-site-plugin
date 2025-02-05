import { FC, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import WarningModal from '@patternfly/react-component-groups/dist/dynamic/WarningModal';
import { Button, ButtonVariant, Checkbox } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const DeleteSiteButton: FC<{ id: string }> = function ({ id }) {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState(false);
  const [removeAllResources, setRemoveAllResources] = useState(true);

  const mutationDeleteSite = useMutation({
    mutationFn: (name: string) => RESTApi.deleteSite(name, removeAllResources)
  });

  const handleDeleteSite = () => mutationDeleteSite.mutate(id);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        {t('Delete site')}
      </Button>

      <WarningModal
        isOpen={isOpen}
        title={t('Permanently remove the site')}
        showClose={false}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDeleteSite}
        confirmButtonVariant={ButtonVariant.danger}
      >
        <Checkbox
          aria-label="delete all checkbox"
          id="delete-all-checkbox"
          label={t('Remove all resources associated with this site')}
          onChange={() => setRemoveAllResources(!removeAllResources)}
          isChecked={removeAllResources}
        />
      </WarningModal>
    </>
  );
};

export default DeleteSiteButton;
