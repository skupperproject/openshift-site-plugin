import { FC } from 'react';

import { NamespaceManager } from '@config/db';
import { K8sResourceCommon } from '@interfaces/CRD_Base';

import App from '../console/App';

const ProjectEntryTab: FC<{ obj: K8sResourceCommon }> = function ({ obj }) {
  const namespace = obj?.metadata?.name as string;

  NamespaceManager.setNamespace(namespace);

  return <App />;
};

export default ProjectEntryTab;
