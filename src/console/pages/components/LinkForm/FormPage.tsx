import { useCallback, FormEvent } from 'react';

import { Form, FormGroup, TextInput, FileUpload, DropEvent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

import { useLinkForm } from './hooks/useLinkForm';

export const FormPage = function () {
  const { t } = useTranslation(I18nNamespace);
  const {
    state: { name, fileName, cost, fileContent },
    dispatch
  } = useLinkForm();

  const handleFileInputChange = useCallback(
    (_: DropEvent, file: File) => {
      dispatch({ type: 'SET_FILE_NAME', payload: getFilenameWithoutExtension(file.name) });
    },
    [dispatch]
  );

  const handleFileContentChange = useCallback(
    (_: DropEvent, value: string) => {
      dispatch({ type: 'SET_FILE_CONTENT', payload: value });
    },
    [dispatch]
  );

  const handleChangeCost = useCallback(
    (_: FormEvent, value: string) => {
      dispatch({ type: 'SET_COST', payload: value });
    },
    [dispatch]
  );

  const handleChangeName = useCallback(
    (_: FormEvent, value: string = '') => {
      dispatch({ type: 'SET_NAME', payload: value });
    },
    [dispatch]
  );

  return (
    <Form isHorizontal>
      <FormGroup isRequired label={t('Token')} fieldId="form-access-token">
        <FileUpload
          id="access-token-file"
          type="text"
          value={fileContent}
          filename={fileName}
          filenamePlaceholder="Drag and drop a file or upload one"
          browseButtonText="Upload"
          hideDefaultPreview={true}
          isClearButtonDisabled={true}
          onFileInputChange={handleFileInputChange}
          onDataChange={handleFileContentChange}
        />
      </FormGroup>

      <FormGroup label={t('Name')} fieldId="form-name-input">
        <TextInput
          isRequired
          id="simple-form-name-01"
          name="simple-form-name-01"
          value={name}
          onChange={handleChangeName}
        />
      </FormGroup>

      <FormGroup label={t('Cost')} fieldId="form-cost-input">
        <TextInput
          isRequired
          id="form-cost"
          name="form-cost"
          aria-describedby="form cost input"
          value={cost}
          onChange={handleChangeCost}
        />
      </FormGroup>
    </Form>
  );
};

function getFilenameWithoutExtension(filename: string) {
  const parts = filename.split('.');
  parts.pop();

  return parts.join('.');
}
