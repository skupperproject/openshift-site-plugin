import { FC, useState } from 'react';

import WarningModal from '@patternfly/react-component-groups/dist/dynamic/WarningModal';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { getSiteInfo } from '@config/db';

const DeleteSiteButton: FC<{ onClick: () => void }> = function ({ onClick }) {
  const { t } = useTranslation(I18nNamespace);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const mutationDeleteSite = useMutation({
    mutationFn: (name: string) => RESTApi.deleteSite(name),
    onSuccess: () => {
      handleClose();
      setTimeout(() => {
        onClick();
      }, 500);
    }
  });

  const handleDeleteSite = () => {
    const name = getSiteInfo()?.name;

    if (name) {
      mutationDeleteSite.mutate(name);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
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
        onClose={handleClose}
        onConfirm={handleDeleteSite}
        confirmButtonVariant={ButtonVariant.danger}
      >
        {t('Are you sure you want to remove this site?')}
      </WarningModal>
    </>
  );
};

export default DeleteSiteButton;
