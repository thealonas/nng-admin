import { create } from "zustand";
import { VkMembersCount } from "../../vk/models/vkMembersCount";

export class GroupStoreElement {
  id: number;
  name: string;
  screen_name: string;
  photo_200: string;
  membersCount: VkMembersCount;

  constructor(
    id: number,
    name: string,
    screen_name: string,
    photo_200: string,
    membersCount: VkMembersCount
  ) {
    this.id = id;
    this.name = name;
    this.screen_name = screen_name;
    this.photo_200 = photo_200;
    this.membersCount = membersCount;
  }
}

export interface GroupStore {
  groups: GroupStoreElement[];
  setGroups: (groups: GroupStoreElement[]) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  setGroups: (groups: GroupStoreElement[]) => set({ groups: groups }),
}));
