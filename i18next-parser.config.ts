interface I18NextParserConfig {
  createOldCatalogs: boolean;
  keySeparator: boolean;
  locales: string[];
  namespaceSeparator: string;
  reactNamespace: boolean;
  defaultValue: (locale: string, namespace: string, key: string) => string;
}

const config: I18NextParserConfig = {
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: function (_, __, key) {
    return key;
  }
};

export default config;
