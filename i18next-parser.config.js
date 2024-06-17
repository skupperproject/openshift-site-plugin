module.exports = {
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultValue: function (_, _, key, _) {
    return key;
  }
};
