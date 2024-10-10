import { useState, FC, FormEvent } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Title,
  Stack,
  StackItem,
  InputGroup,
  FormSelect,
  FormSelectOption,
  InputGroupItem
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';

const DEFAULT_EXPIRATION = 15;
const DEFAULT_CLAIMS = 1;

enum ValidForUnit {
  Minutes = 'm',
  Hours = 'h'
}

const options = [
  { value: ValidForUnit.Minutes, label: 'min' },
  { value: ValidForUnit.Hours, label: 'hr' }
];

export const FormPage: FC<{
  name?: string;
  onSetName(value: string): void;
  onSetValidFor(value: number | undefined): void;
  onSetValidForUnit(value: ValidForUnit): void;
  onSetClaims(value: number | undefined): void;
  onSetCode(value: string): void;
}> = function ({ name, onSetName, onSetValidFor, onSetValidForUnit, onSetClaims, onSetCode }) {
  const { t } = useTranslation(I18nNamespace);

  const [expiration, setExpiration] = useState<number | undefined>(DEFAULT_EXPIRATION);
  const [claims, setClaims] = useState<number | undefined>(DEFAULT_CLAIMS);
  const [timeDimension, setTimeDimension] = useState(options[0].value);
  const [code, setCode] = useState<string>('');

  const handleSetName = (_: FormEvent, value: string) => {
    onSetName(value);
  };

  const handleSetClaimExpiration = (value: string) => {
    let numberValue: number | undefined = Number(value);

    // If the input is not a valid number or less than/equal to 0, set numberValue to 1
    if (isNaN(numberValue) || numberValue <= 0) {
      numberValue = DEFAULT_EXPIRATION;
    }

    // If the input is empty, set numberValue to undefined
    if (!value) {
      numberValue = undefined;
    }

    setExpiration(numberValue);
    onSetValidFor(numberValue);
  };
  const handleSetClaimsMade = (value: string) => {
    let numberValue: number | undefined = Number(value);

    if (isNaN(numberValue) || numberValue <= 0) {
      numberValue = DEFAULT_CLAIMS;
    }

    if (!value) {
      numberValue = undefined;
    }

    setClaims(numberValue);
    onSetClaims(numberValue);
  };

  const onChangeTimeDimension = (value: ValidForUnit) => {
    setTimeDimension(value);
    onSetValidForUnit(value);
  };

  const handleSetCode = (value: string) => {
    setCode(value);
    onSetCode(value);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Configuration')}</Title>
      </StackItem>

      <StackItem>
        <Form isHorizontal>
          <FormGroup fieldId="filename-input" isRequired label={t('File name')} title=" ">
            <TextInput
              aria-label="filename input"
              isRequired
              type="text"
              value={name}
              onChange={handleSetName}
              autoFocus
            />
          </FormGroup>

          <FormGroup
            fieldId="redemption-allowed-input"
            label={t('Redemptions Allowed')}
            labelIcon={<TooltipInfoButton content={t('tooltipRedemptionAllowed')} />}
            title=""
          >
            <TextInput
              aria-label="redemption allowed input"
              value={claims}
              onChange={(_, value) => handleSetClaimsMade(value)}
              style={{ maxWidth: '100%' }}
            />
          </FormGroup>

          <FormGroup
            fieldId="code-input"
            label={t('Code')}
            labelIcon={<TooltipInfoButton content={t('tooltipCode')} />}
            title=""
          >
            <TextInput aria-label="code input" value={code} onChange={(_, value) => handleSetCode(value)} />
          </FormGroup>

          <FormGroup
            fieldId="expirationWindow-input"
            label={t('Valid for')}
            labelIcon={<TooltipInfoButton content={t('tooltipExpirationWindow')} />}
            title=""
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  aria-label="expiration window input"
                  value={expiration}
                  onChange={(_, value) => handleSetClaimExpiration(value)}
                />
              </InputGroupItem>
              <InputGroupItem style={{ width: '70px' }}>
                <FormSelect
                  value={timeDimension}
                  onChange={(_, value) => onChangeTimeDimension(value as ValidForUnit)}
                  aria-label="form valid for select"
                >
                  {options.map((option, index) => (
                    <FormSelectOption key={index} value={option.value} label={option.label} />
                  ))}
                </FormSelect>
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
        </Form>
      </StackItem>
    </Stack>
  );
};
