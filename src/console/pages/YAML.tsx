import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { useQuery } from '@tanstack/react-query';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';

const YAML = function () {
  const { data: sites } = useQuery({
    queryKey: ['find-yaml-query'],
    queryFn: () => RESTApi.getSites()
  });

  if (!sites) {
    return null;
  }

  return <CodeEditor value={stringify(sites.items[0])} options={{ readOnly: true }} minHeight={'95%'} />;
};

export default YAML;
