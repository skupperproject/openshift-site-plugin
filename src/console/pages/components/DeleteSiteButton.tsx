import { FC, useState } from 'react';

import WarningModal from '@patternfly/react-component-groups/dist/dynamic/WarningModal';
import { Button, ButtonVariant, Checkbox } from '@patternfly/react-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { QueryKeys } from '@config/reactQuery';

const DeleteSiteButton: FC<{ id: string }> = function ({ id }) {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState(false);
  const [removeAllResources, setRemoveAllResources] = useState(true);

  const queryClient = useQueryClient();
  const mutationDeleteSite = useMutation({
    mutationFn: (name: string) => RESTApi.deleteSite(name, removeAllResources),
    onSuccess: () => {
      console.log('deleted successfully');
      queryClient.invalidateQueries([QueryKeys.FindSite]);
      queryClient.invalidateQueries([QueryKeys.FindSite]);
    } // Invalidate the site query to refetch and switch back to EmptySite
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
          onClick={() => setRemoveAllResources(!removeAllResources)}
          isChecked={removeAllResources}
        />
      </WarningModal>
    </>
  );
};

export default DeleteSiteButton;
