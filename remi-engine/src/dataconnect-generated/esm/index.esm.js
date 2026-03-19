import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'kitch-recipe-app',
  location: 'us-central1'
};

export const listRecipesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecipes');
}
listRecipesRef.operationName = 'ListRecipes';

export function listRecipes(dc) {
  return executeQuery(listRecipesRef(dc));
}

export const listPantryItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPantryItems');
}
listPantryItemsRef.operationName = 'ListPantryItems';

export function listPantryItems(dc) {
  return executeQuery(listPantryItemsRef(dc));
}

