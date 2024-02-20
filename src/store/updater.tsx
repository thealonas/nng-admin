import Cookies from "universal-cookie";
import { NngApi } from "../api/nngApi";
import { COOKIE_API_TOKEN_KEY, COOKIE_VK_TOKEN_KEY } from "../constants";
import { VkApi } from "../vk/vkApi";
import { useNngApiStore } from "./apiStore";
import { useVkStore } from "./vkStore";

const cookies = new Cookies();

export type GetTokensFunction = () => Promise<[string, string]>;
export type WhoAmIFunction = (apiToken: string) => Promise<number>;
export type InitializeStoresFunction = (
  vkToken: string,
  apiToken: string,
  currentUserId: number
) => void;

export const useStoreUpdater = (): [
  GetTokensFunction,
  WhoAmIFunction,
  InitializeStoresFunction,
] => {
  const vkStore = useVkStore();
  const nngApiStore = useNngApiStore();

  const getTokens = async (): Promise<[string, string]> => {
    const apiToken = cookies.get(COOKIE_API_TOKEN_KEY);
    const vkToken = cookies.get(COOKIE_VK_TOKEN_KEY);
    return [apiToken, vkToken];
  };

  const whoAmI = async (apiToken: string) => {
    const whoAmIResponse = await NngApi.whoAmI(apiToken);
    return whoAmIResponse["is_valid"] ? whoAmIResponse["user_id"] : -1;
  };

  const initializeStores = (
    vkToken: string,
    apiToken: string,
    currentUserId: number
  ) => {
    vkStore.setVkApi(new VkApi(vkToken, apiToken));
    nngApiStore.setNngApi(new NngApi(apiToken));
    nngApiStore.setCurrentUserId(currentUserId);
  };

  return [getTokens, whoAmI, initializeStores];
};
