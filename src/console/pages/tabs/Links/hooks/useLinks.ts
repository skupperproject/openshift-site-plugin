import { RESTApi } from '@API/REST.api';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { useMutation } from '@tanstack/react-query';
import { stringify } from 'yaml';

import { handleYamlFilename } from '../../../../core/utils/handleYamlFilename';
import { createAccessTokenRequest } from '../../../../core/utils/createCRD';
import { useWatchedSkupperResource } from '../../../../hooks/useSkupperWatchResource';

export const useLinks = () => {
  const { data: accessGrants, loaded: grantLoaded } = useWatchedSkupperResource({ kind: 'AccessGrant' });
  const { data: accessTokens, loaded: tokenLoaded } = useWatchedSkupperResource({ kind: 'AccessToken' });
  const { data: links, loaded: linkLoaded } = useWatchedSkupperResource({ kind: 'Link' });
  const { data: sites, loaded: siteLoaded } = useWatchedSkupperResource({ kind: 'Site' });

  const remoteLinks =
    sites?.[0].remoteLinks?.map((name) => ({
      connectedTo: name
    })) || [];

  const deleteGrantMutation = useMutation({
    mutationFn: (name: string) => RESTApi.deleteGrant(name)
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (name: string) => RESTApi.deleteLink(name)
  });

  const deleteAccessTokenMutation = useMutation({
    mutationFn: (name: string) => RESTApi.deleteAccessToken(name)
  });

  const handleDeleteLink = (name: string) => {
    let accessTokenName = accessTokens?.find((item) => item.name === name);

    if (!accessTokenName) {
      accessTokenName = accessTokens?.find((item) => name.includes(item.name));
    }

    if (accessTokenName) {
      deleteAccessTokenMutation.mutate(accessTokenName?.name);
    }
    deleteLinkMutation.mutate(name);
  };

  const handleDownloadGrant = (grant: AccessGrantCrdResponse) => {
    const isReady = grant?.status?.status === 'Ready';
    if (isReady) {
      const accessToken = createAccessTokenRequest({
        metadata: { name: grant.metadata.name },
        spec: {
          linkCost: 1,
          ca: grant.status!.ca,
          code: grant.status!.code,
          url: grant.status!.url
        }
      });

      const blob = new Blob([stringify(accessToken)], { type: 'application/json' });
      const filename = handleYamlFilename(accessToken.metadata.name);

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  };

  return {
    data: {
      accessGrants,
      accessTokens,
      links,
      remoteLinks
    },
    loading: !grantLoaded || !tokenLoaded || !linkLoaded || !siteLoaded,
    actions: {
      handleDeleteLink,
      handleDeleteGrant: deleteGrantMutation.mutate,
      handleDownloadGrant
    }
  };
};
