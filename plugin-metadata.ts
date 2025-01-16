import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

const metadata: ConsolePluginBuildMetadata = {
  name: 'openshift-site-plugin',
  version: '1.0.0',
  displayName: 'Openshift Site Plugin',
  description: 'OpenShift Console plugin for managing sites.',
  exposedModules: {
    ProjectEntryTab: './openshift/ProjectEntryTab'
  },
  dependencies: {
    '@console/pluginAPI': '*'
  }
};

export default metadata;
