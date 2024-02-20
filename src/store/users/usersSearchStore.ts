import { create } from "zustand";
import { User } from "../../api/categories/usersCategory";
import { VkUser } from "../../vk/models/vkUser";

export interface UserSearchStore {
  overviewVkUsers: VkUser[];
  overviewApiUsers: User[];
  setOverviewVkUsers: (users: VkUser[]) => void;
  setOverviewApiUsers: (users: User[]) => void;

  userSearch: string;
  setUserSearch: (search: string) => void;
}

export const userUsersSearchStore = create<UserSearchStore>((set) => ({
  overviewVkUsers: [],
  overviewApiUsers: [],
  setOverviewVkUsers: (users) => set({ overviewVkUsers: users }),
  setOverviewApiUsers: (users) => set({ overviewApiUsers: users }),

  userSearch: "",
  setUserSearch: (search) => set({ userSearch: search }),
}));
