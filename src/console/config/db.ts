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

export const createConsoleRouteManager = () => {
  let name = '';

  return {
    setName: (initialRouteName: string) => {
      name = initialRouteName;
    },
    getName: () => name
  };
};

export const ConsoleRouteManager = createConsoleRouteManager();
