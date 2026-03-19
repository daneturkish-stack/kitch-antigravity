import { ConnectorConfig, DataConnect, QueryRef, QueryPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Ingredient_Key {
  id: UUIDString;
  __typename?: 'Ingredient_Key';
}

export interface ListPantryItemsData {
  pantryItems: ({
    id: UUIDString;
    ingredientName: string;
    quantity: number;
    unit: string;
  } & PantryItem_Key)[];
}

export interface ListRecipesData {
  recipes: ({
    id: UUIDString;
    title: string;
    sourceUrl: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Recipe_Key)[];
}

export interface PantryItem_Key {
  id: UUIDString;
  __typename?: 'PantryItem_Key';
}

export interface Recipe_Key {
  id: UUIDString;
  __typename?: 'Recipe_Key';
}

export interface SubscriptionType_Key {
  id: UUIDString;
  __typename?: 'SubscriptionType_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListRecipesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRecipesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRecipesData, undefined>;
  operationName: string;
}
export const listRecipesRef: ListRecipesRef;

export function listRecipes(): QueryPromise<ListRecipesData, undefined>;
export function listRecipes(dc: DataConnect): QueryPromise<ListRecipesData, undefined>;

interface ListPantryItemsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPantryItemsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPantryItemsData, undefined>;
  operationName: string;
}
export const listPantryItemsRef: ListPantryItemsRef;

export function listPantryItems(): QueryPromise<ListPantryItemsData, undefined>;
export function listPantryItems(dc: DataConnect): QueryPromise<ListPantryItemsData, undefined>;

