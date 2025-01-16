export const createNamespaceManager = (initialNamespace: string) => {
  const namespace = initialNamespace;

  return {
    getNamespace: () => namespace
  };
};

export const NamespaceManager = createNamespaceManager('');
