import { FC, useState } from 'react';

import WarningModal from '@patternfly/react-component-groups/dist/dynamic/WarningModal';
import { Button, ButtonVariant, Checkbox } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';

const DeleteSiteButton: FC<{ id: string; onClick: () => void }> = function ({ id, onClick }) {
  const { t } = useTranslation(I18nNamespace);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removeAllResources, setRemoveAllResources] = useState(true);

  const mutationDeleteSite = useMutation({
    mutationFn: (name: string) => RESTApi.deleteSite(name, removeAllResources),
    onSuccess: () => onClick()
  });

  const handleDeleteSite = () => {
    if (id) {
      mutationDeleteSite.mutate(id);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
        {t('Delete site')}
      </Button>

      <WarningModal
        isOpen={isModalOpen}
        title={t('Permanently remove the site')}
        showClose={false}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteSite}
        confirmButtonVariant={ButtonVariant.danger}
      >
        <Checkbox
          aria-label="delete all checkbox"
          id="delete-all-checkbox"
          label={t('Remove all resources associated with this site')}
          onClick={() => setRemoveAllResources(!removeAllResources)}
          isChecked={removeAllResources}
        />
      </WarningModal>
    </>
  );
};

export default DeleteSiteButton;
