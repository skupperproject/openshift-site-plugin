import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';

const consoleSection: EncodedExtension = {
  type: 'console.tab/horizontalNav',
  properties: {
    model: {
      version: 'v1',
      kind: 'Project',
      group: 'project.openshift.io'
    },
    page: {
      name: 'Service Interconnect',
      href: 'openshift-site-plugin'
    },
    component: { $codeRef: 'ProjectEntryTab' }
  }
};

const extensions: EncodedExtension[] = [consoleSection];

export default extensions;
