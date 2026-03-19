import { ListRecipesData, ListPantryItemsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListRecipes(options?: useDataConnectQueryOptions<ListRecipesData>): UseDataConnectQueryResult<ListRecipesData, undefined>;
export function useListRecipes(dc: DataConnect, options?: useDataConnectQueryOptions<ListRecipesData>): UseDataConnectQueryResult<ListRecipesData, undefined>;

export function useListPantryItems(options?: useDataConnectQueryOptions<ListPantryItemsData>): UseDataConnectQueryResult<ListPantryItemsData, undefined>;
export function useListPantryItems(dc: DataConnect, options?: useDataConnectQueryOptions<ListPantryItemsData>): UseDataConnectQueryResult<ListPantryItemsData, undefined>;
