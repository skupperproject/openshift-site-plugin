import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { REFETCH_QUERY_INTERVAL } from '@config/config';

const YAML = function () {
  const { data: sites } = useQuery({
    queryKey: ['find-yaml-query'],
    queryFn: () => RESTApi.getSites(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  return (
    <Card isFullHeight>
      <CardBody>
        <CodeEditor value={stringify(sites?.items[0])} options={{ readOnly: true }} minHeight={'95%'} />
      </CardBody>
    </Card>
  );
};

export default YAML;
