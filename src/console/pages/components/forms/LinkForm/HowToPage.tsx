import step1 from '@assets/step1.png';
import step2 from '@assets/step2.png';
import step3 from '@assets/step3.png';
import step4 from '@assets/step4.png';
import { I18nNamespace } from '@config/config';
import InstructionBlock from '@core/components/InstructionBlock';
import { StackItem, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export const HowToPage = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Stack hasGutter>
      <StackItem>
        <InstructionBlock
          img={step1}
          title={t('Step 1 - Visit a remote site')}
          description={t('Open a new browser window or tab and visit the remote site.')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={step2}
          title={t('Step 2 - Generate a access token from the remote site')}
          description={t('Generate the access token with the web console or the CLI.')}
          link1="https://skupper.io/docs/cli/tokens.html"
          link1Text="More information on token creation"
          link2="https://skupper.io/docs/cli/index.html"
          link2Text="More information CLI"
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={step3}
          title={t('Step 3 - Download the access token file')}
          description={t('Download the access token file from the remote site after generating it.')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={step4}
          title={t('Step 4 - Use the access token to create a link')}
          description={t('Use the access token to create a link from the local site to the remote site.')}
        />
      </StackItem>
    </Stack>
  );
};
