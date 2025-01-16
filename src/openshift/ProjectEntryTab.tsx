import { FC } from 'react';

import { createNamespaceManager } from '@config/db';
import { K8sResourceCommon } from '@interfaces/CRD_Base';

import App from '../console/App';

const ProjectEntryTab: FC<{ obj: K8sResourceCommon }> = function ({ obj }) {
  const namespace = obj?.metadata?.name as string;

  createNamespaceManager(namespace);

  return <App />;
};

export default ProjectEntryTab;
