import { createServer, Registry, Request, Response } from 'miragejs';
import type { AnyModels, FactoryDefinition } from 'miragejs/-types';
import type Schema from 'miragejs/orm/schema';

import { configMapPath, operatorGroupsPath, secretsPath, subscriptionsPath } from '@API/REST.paths';
import {
  K8sResourceConfigMap,
  K8sResourceLink,
  K8sResourceNetworkStatusConfigMap,
  K8sResourceSecret,
  K8sResourceSecretList
} from '@K8sResources/resources.interfaces';

type AppRegistry = Registry<AnyModels, Record<string, FactoryDefinition>>;

type AppSchema = Schema<AppRegistry>;

export const MockApi = {
  get500Error: () => new Response(500),
  get503Error: () => new Response(503),
  get404Error: () => new Response(404),

  findSite: (schema: AppSchema, { params }: Request): K8sResourceConfigMap | K8sResourceNetworkStatusConfigMap => {
    if (params.name === 'skupper-network-status') {
      return {
        data: {
          NetworkStatus: networkstatusmock
        }
      } as K8sResourceNetworkStatusConfigMap;
    }

    if (!schema.db.site.length) {
      return { code: 404 };
    }

    return schema.db.site[0] as K8sResourceConfigMap;
  },

  createSite: (schema: AppSchema, { requestBody }: Request): K8sResourceConfigMap => {
    const data = JSON.parse(requestBody) as K8sResourceConfigMap;
    const metadata = { ...data.metadata, resourceVersion: 'X.X.X' };

    return schema.db.site.insert({ ...data, metadata });
  },

  deleteSite: (schema: AppSchema, { params: { name } }: Request): null => {
    schema.db.site.remove(name);

    return null;
  },

  getSecrets: (schema: AppSchema, { queryParams }: Request): K8sResourceSecretList => {
    const items = schema.db.links[0].items.filter(
      (link: K8sResourceLink) =>
        link.metadata.labels && link.metadata.labels['skupper.io/type'] === queryParams.labelSelector
    );

    return { items };
  },

  findSecret: (schema: AppSchema, { queryParams }: Request): K8sResourceSecret => {
    if (!schema.db.site.length) {
      return { code: 404 };
    }

    const item = schema.db.links[0].items.filter(
      (link: K8sResourceLink) =>
        link.metadata.labels && link.metadata.labels['skupper.io/type=connection-token'] === queryParams.labelSelector
    );

    return item;
  },

  createLink: (schema: AppSchema, { requestBody }: Request): K8sResourceLink => {
    const data = JSON.parse(requestBody) as K8sResourceLink;

    return schema.db.links.insert(data);
  },

  deleteLink: (schema: AppSchema, { requestBody }: Request): null => {
    const id = JSON.parse(requestBody) as string;

    schema.db.links.remove(id);

    return null;
  },

  getTokens: (schema: AppSchema): K8sResourceSecretList[] => schema.db.tokens,

  createToken: (schema: AppSchema, { requestBody }: Request): string => {
    const data = JSON.parse(requestBody) as K8sResourceSecret;

    schema.db.tokens.insert(data);

    return btoa(`
     apiVersion: v1
     data:
       ca.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURMRENDQWhTZ0F3SUJBZ0lRWGQ2YXpIbU9JeHFOcnpYamZyUGZmREFOQmdrcWhraUc5dzBCQVFzRkFEQWEKTVJnd0ZnWURWUVFERXc5emEzVndjR1Z5TFhOcGRHVXRZMkV3SGhjTk1qUXdNVEE0TWpJeE5ETXpXaGNOTWprdwpNVEEyTWpJeE5ETXpXakFhTVJnd0ZnWURWUVFERXc5emEzVndjR1Z5TFhOcGRHVXRZMkV3Z2dFaU1BMEdDU3FHClNJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUURjb0hPQmFtb3dVUWNsaHpqVFlTSXFkS1JXTWtaSXBuQUUKcjRhVmVBZlIrQlcydU8zQ1FRdHVOOERtZUFYVGE4NWxRVnBUTFVhcGtZbCtRSzRXNVdvT0lva2IvK3NXNkx2UwpCK2VsZnFjQTdRZDJ2Tnl0VG5ZcllhRWErQzhEeUhOTVpTY0NiU3Z5V1BuVXZyK1dGWm91bEpWUDFjdFEyUUx4Cmd3M3huanpGa1dEczVOOTFteVlOelpSZWhDWGVHQlB1S1JWcHBzcXViMFRFdTFwMG5wMkpYdC84N1R6OUI2bU0Kam45VU4rRndkRDFlTjUwZ1p3MWJ0UHFVR0hLOThjSDk5WFAwTWZOU2hhRHpVTWQralM3SVBiMndtWVJEV1UvQwpEcitLV0xiV0ZoUUg4YXdTdVZ0MGcrMFp5ZDFuR2JBVEZHYUs4cCt4c1Z4bmN2ZTZ6Y0pCQWdNQkFBR2piakJzCk1BNEdBMVVkRHdFQi93UUVBd0lDcERBZEJnTlZIU1VFRmpBVUJnZ3JCZ0VGQlFjREFRWUlLd1lCQlFVSEF3SXcKRHdZRFZSMFRBUUgvQkFVd0F3RUIvekFkQmdOVkhRNEVGZ1FVa29jc25kWDMvNDBNVDBlZWpqcG9rNElYOFFrdwpDd1lEVlIwUkJBUXdBb0lBTUEwR0NTcUdTSWIzRFFFQkN3VUFBNElCQVFBUVAwQ1NOc2JKKzJFdjBUNjNGNnQ2CjZ5YUtMaG5ySnhtcjFzclY2WnlEUnpVRUZRQlkvVnZ4SzdWK0FuMGV5aVQ3ZzkxNjIrTi9OclJnNStzSmNCMXIKMndrTzZ0Rk13YzR2YytJREtMY1dOelZCSkhhT1lnUjNzR05KMTdtMUM1YXo3WUZvbXJNdmFwdC9RN2NhYWY0Nwp6aGVWQ01DdmJ2UUtpdlliNkNsZ3I4dUhuVHFWaWoySjdObzV6SEhUUFlCT25WU1JMVDd0bERydVIxL1pUOWdLCmlGWDc5MFBBZkIzQUhnMkh0S0pyQlpwUWk1V0RqeUE4Q1JadzBjTWUwOElFem4yelZDUy9lZEdNVHJtM0NUdmkKT1VKS1NXdlVtYWkvTE91c0NvT3hOWm81TjZUZjN2TXZQYlJieWFjcUd0Z3dnSTlrVCs4Q0lTOGo1UFF5Y2pnbAotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==
       password: bUlmWlQwdkkxY1VCaExzZ05mS3ZZMnVh
     kind: Secret
     metadata:
       annotations:
         skupper.io/generated-by: 67b7e59e-37aa-4179-8191-077b7a0d90d7
         skupper.io/site-version: 1.5.2
         skupper.io/url: https://claims-xxx-0-153f1de160110098c1928a6c05e19444-0000.us-east.containers.appdomain.cloud:443/6fe5599e-ae73-11ee-b75a-902e1655a5fe
       creationTimestamp: null
       labels:
         skupper.io/type: token-claim
       name: 6fe5599e-ae73-11ee-b75a-902e1655a5fe
       `);
  }
};

export const MockApiPaths = {
  OperatorGroups: operatorGroupsPath(),
  Subscriptions: subscriptionsPath(),
  ConfigMaps: configMapPath(),
  ConfigMapItem: `${configMapPath()}/:name`,
  Secrets: secretsPath(),
  SecretItem: `${secretsPath()}/:name`
};

export function loadMockServer() {
  return createServer({
    seeds(server) {
      server.db.loadData({
        site: null as K8sResourceConfigMap | null,
        links: {
          items: [] as K8sResourceLink[]
        } as K8sResourceSecretList,
        tokens: {} as K8sResourceSecretList
      });
    },
    routes() {
      this.get(MockApiPaths.OperatorGroups, () => ({ items: [{ metadata: { uid: '1' } }] }));
      this.get(MockApiPaths.Subscriptions, () => ({ items: [{ metadata: { name: 'skupper-operator' } }] }));

      this.post(MockApiPaths.ConfigMaps, MockApi.createSite);
      this.delete(MockApiPaths.ConfigMapItem, MockApi.deleteSite);
      this.get(MockApiPaths.ConfigMapItem, MockApi.findSite);

      this.post(MockApiPaths.Secrets, MockApi.createToken);

      this.get(MockApiPaths.Secrets, MockApi.getSecrets);
      this.post(MockApiPaths.Secrets, MockApi.createLink);
      this.delete(MockApiPaths.Secrets, MockApi.deleteLink);

      this.get(MockApiPaths.SecretItem, MockApi.findSecret);

      this.passthrough();
    }
  });
}

const networkstatusmock = `{"addresses":[{"recType":"ADDRESS","identity":"e9cb33f7-49a8-4613-8ba2-b4a933374a52","startTime":1706541879219853,"endTime":0,"name":"adservice:9876","protocol":"tcp","listenerCount":2,"connectorCount":1},{"recType":"ADDRESS","identity":"947a3d79-f3b4-44c3-9e22-e4c211c3df3c","startTime":1706543619281923,"endTime":0,"name":"cartservice:767676","protocol":"http2","listenerCount":0,"connectorCount":1},{"recType":"ADDRESS","identity":"fabac99a-e07b-44d4-806d-0e8d06eeac6a","startTime":1706536612742377,"endTime":0,"name":"cartservice:7890","protocol":"http2","listenerCount":2,"connectorCount":0},{"recType":"ADDRESS","identity":"ddbfad42-f193-4c27-8018-bc3aabeb5182","startTime":1706541253896162,"endTime":0,"name":"cartservice:8907","protocol":"http2","listenerCount":0,"connectorCount":0},{"recType":"ADDRESS","identity":"10e4c1cc-210f-4c51-b1cb-7d6f3314e6c2","startTime":1706541993693747,"endTime":0,"name":"checkoutservice:8765","protocol":"http2","listenerCount":2,"connectorCount":1}],"siteStatus":[{"site":{"recType":"SITE","identity":"4f82f33d-eafa-4fc1-8186-d9117ce032eb","startTime":1706510973000000,"endTime":0,"source":"4f82f33d-eafa-4fc1-8186-d9117ce032eb","platform":"kubernetes","name":"vb-site-test-1","nameSpace":"vb-site-test-1","siteVersion":"1.5.3","policy":"disabled"},"routerStatus":[{"router":{"recType":"ROUTER","identity":"xlznx:0","parent":"4f82f33d-eafa-4fc1-8186-d9117ce032eb","startTime":1706510979938939,"endTime":0,"source":"xlznx:0","name":"0/vb-site-test-1-skupper-router-68768b7949-xlznx","namespace":"vb-site-test-1","imageName":"skupper-router","imageVersion":"latest","hostname":"skupper-router-68768b7949-xlznx","buildVersion":"2.5.1"},"links":[{"recType":"LINK","identity":"xlznx:46","parent":"xlznx:0","startTime":1706567666969129,"endTime":0,"source":"xlznx:0","mode":"interior","name":"vb-site-test-2-skupper-router-744964b79b-twwch","direction":"incoming"}],"listeners":[{"recType":"LISTENER","identity":"xlznx:39","parent":"xlznx:0","startTime":1706541993693747,"endTime":0,"source":"xlznx:0","name":"checkoutservice:8765","destHost":"0.0.0.0","destPort":"8765","protocol":"http2","address":"checkoutservice:8765","addressId":"10e4c1cc-210f-4c51-b1cb-7d6f3314e6c2"},{"recType":"LISTENER","identity":"xlznx:22","parent":"xlznx:0","startTime":1706536612742377,"endTime":0,"source":"xlznx:0","name":"cartservice:7890","destHost":"0.0.0.0","destPort":"1034","protocol":"http2","address":"cartservice:7890","addressId":"fabac99a-e07b-44d4-806d-0e8d06eeac6a"},{"recType":"LISTENER","identity":"xlznx:37","parent":"xlznx:0","startTime":1706541879219853,"endTime":0,"source":"xlznx:0","name":"adservice:9876","destHost":"0.0.0.0","destPort":"1035","protocol":"tcp","address":"adservice:9876","addressId":"e9cb33f7-49a8-4613-8ba2-b4a933374a52"}],"connectors":[{"recType":"CONNECTOR","identity":"xlznx:40","parent":"xlznx:0","startTime":1706542027766503,"endTime":0,"source":"xlznx:0","destHost":"172.17.5.166","destPort":"8765","protocol":"http2","address":"checkoutservice:8765","target":"checkoutservice-79cf7f4c8b-s87pf","processId":"59b0abc1-7dfc-4dfe-974b-da837b1ed2a5","addressId":"10e4c1cc-210f-4c51-b1cb-7d6f3314e6c2"},{"recType":"CONNECTOR","identity":"xlznx:42","parent":"xlznx:0","startTime":1706543619173170,"endTime":0,"source":"xlznx:0","destHost":"172.17.5.188","destPort":"767676","protocol":"http2","address":"cartservice:767676","target":"cartservice-9d5469458-ztxqq","processId":"bfb61533-67f8-4672-ae4a-1b0f1f11d3c7","addressId":"947a3d79-f3b4-44c3-9e22-e4c211c3df3c"},{"recType":"CONNECTOR","identity":"xlznx:38","parent":"xlznx:0","startTime":1706541904203827,"endTime":0,"source":"xlznx:0","destHost":"172.17.3.169","destPort":"9876","protocol":"tcp","address":"adservice:9876","target":"adservice-fb7775586-z2xm5","processId":"78ade18b-a435-476c-ba1e-2607a1293c3f","addressId":"e9cb33f7-49a8-4613-8ba2-b4a933374a52"}]}]},{"site":{"recType":"SITE","identity":"f1797080-ef1b-47a0-b24d-b3ed748c8dcd","startTime":1706511028000000,"endTime":0,"source":"f1797080-ef1b-47a0-b24d-b3ed748c8dcd","platform":"kubernetes","name":"vb-site-test-2","nameSpace":"vb-site-test-2","siteVersion":"1.5.3","policy":"disabled"},"routerStatus":[{"router":{"recType":"ROUTER","identity":"twwch:0","parent":"f1797080-ef1b-47a0-b24d-b3ed748c8dcd","startTime":1706511037975482,"endTime":0,"source":"twwch:0","name":"0/vb-site-test-2-skupper-router-744964b79b-twwch","namespace":"vb-site-test-2","imageName":"skupper-router","imageVersion":"latest","hostname":"skupper-router-744964b79b-twwch","buildVersion":"2.5.1"},"links":[{"recType":"LINK","identity":"twwch:10","parent":"twwch:0","startTime":1706567666871981,"endTime":0,"source":"twwch:0","mode":"interior","name":"vb-site-test-1-skupper-router-68768b7949-xlznx","linkCost":1,"direction":"outgoing"}],"listeners":[{"recType":"LISTENER","identity":"twwch:11","parent":"twwch:0","startTime":1706567670997322,"endTime":0,"source":"twwch:0","name":"adservice:9876","destHost":"0.0.0.0","destPort":"1030","protocol":"tcp","address":"adservice:9876","addressId":"e9cb33f7-49a8-4613-8ba2-b4a933374a52"},{"recType":"LISTENER","identity":"twwch:12","parent":"twwch:0","startTime":1706567670999656,"endTime":0,"source":"twwch:0","name":"checkoutservice:8765","destHost":"0.0.0.0","destPort":"1031","protocol":"http2","address":"checkoutservice:8765","addressId":"10e4c1cc-210f-4c51-b1cb-7d6f3314e6c2"},{"recType":"LISTENER","identity":"twwch:5","parent":"twwch:0","startTime":1706536643852623,"endTime":0,"source":"twwch:0","name":"cartservice:7890","destHost":"0.0.0.0","destPort":"1027","protocol":"http2","address":"cartservice:7890","addressId":"fabac99a-e07b-44d4-806d-0e8d06eeac6a"}],"connectors":null}]}]}
`;
