import { useCallback, FormEvent } from 'react';

import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

import { useLinkForm } from './hooks/useLinkForm';
import { MultipleFileUploadBasic } from './MultiUpload';

export const FormPage = function () {
  const { t } = useTranslation(I18nNamespace);
  const {
    state: { name, cost },
    dispatch
  } = useLinkForm();

  const handleFileNameChange = useCallback(
    (value: File[]) => {
      const names = value.map((file) => getFilenameWithoutExtension(file.name));

      dispatch({ type: 'SET_FILE_NAMES', payload: names });
    },
    [dispatch]
  );

  const handleFileContentChange = useCallback(
    (fileContents: string[]) => {
      dispatch({ type: 'SET_FILES', payload: fileContents });
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
        <MultipleFileUploadBasic
          onFileContentChange={handleFileContentChange}
          onFileNamesChange={handleFileNameChange}
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
