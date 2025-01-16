export const createNamespaceManager = () => {
  let namespace = '';

  return {
    setNamespace: (initialNamespace: string) => {
      namespace = initialNamespace;
    },
    getNamespace: () => namespace
  };
};

export const NamespaceManager = createNamespaceManager();
