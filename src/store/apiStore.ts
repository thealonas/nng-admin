import { create } from "zustand";
import { NngApi } from "../api/nngApi";

export interface NngApiStore {
  nngApi: NngApi;
  setNngApi: (api: NngApi) => void;

  currentUserId: number;
  setCurrentUserId: (id: number) => void;
}

export const useNngApiStore = create<NngApiStore>((set) => ({
  nngApi: new NngApi(""),
  setNngApi: (api: NngApi) => set({ nngApi: api }),
  currentUserId: 0,
  setCurrentUserId: (id: number) =>
    set({
      currentUserId: id,
    }),
}));
