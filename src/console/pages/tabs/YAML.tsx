import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { REFETCH_QUERY_INTERVAL } from '@config/config';
import { QueryKeys } from '@config/reactQuery';

const YAML = function () {
  const { data: site } = useQuery({
    queryKey: [QueryKeys.FindSite],
    queryFn: () => RESTApi.findSite(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  return (
    <Card isFullHeight>
      <CardBody>
        <CodeEditor value={stringify(site)} options={{ readOnly: true }} minHeight={'95%'} />
      </CardBody>
    </Card>
  );
};

export default YAML;
