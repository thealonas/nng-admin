import { create } from "zustand";
import { VkApi } from "../vk/vkApi";

export interface VkStore {
  vkApi: VkApi;
  setVkApi: (vkApi: VkApi) => void;
}

export const useVkStore = create<VkStore>((set) => ({
  vkApi: new VkApi("", ""),
  setVkApi: (vkApi) => set({ vkApi }),
}));
