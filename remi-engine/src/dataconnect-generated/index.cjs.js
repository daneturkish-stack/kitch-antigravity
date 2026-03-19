const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'kitch-recipe-app',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const listRecipesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecipes');
}
listRecipesRef.operationName = 'ListRecipes';
exports.listRecipesRef = listRecipesRef;

exports.listRecipes = function listRecipes(dc) {
  return executeQuery(listRecipesRef(dc));
};

const listPantryItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPantryItems');
}
listPantryItemsRef.operationName = 'ListPantryItems';
exports.listPantryItemsRef = listPantryItemsRef;

exports.listPantryItems = function listPantryItems(dc) {
  return executeQuery(listPantryItemsRef(dc));
};
