import { API_URL } from "../constants";
import { VkGroup } from "./models/vkGroup";
import { VkMembersCount } from "./models/vkMembersCount";
import { VkUser } from "./models/vkUser";

export class VkApi {
  private readonly VK_API_VERSION = "5.199";

  private readonly vkToken: string;
  private readonly apiToken: string;

  constructor(vkToken: string, apiToken: string) {
    this.vkToken = vkToken;
    this.apiToken = apiToken;
  }

  public async callMethod(
    methodName: string,
    params: Record<string, string>
  ): Promise<any> {
    params["v"] = this.VK_API_VERSION;
    params["access_token"] = this.vkToken;

    const methodParams: Record<string, any> = {
      method: methodName,
      params: params,
    };

    return await (
      await fetch(`${API_URL}/vk/call_method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(methodParams),
      })
    ).json();
  }

  public async getUsersInfo(users: number[]): Promise<VkUser[]> {
    if (users.length === 0) {
      return [];
    }

    const response = await this.callMethod("execute.getUsers", {
      user_ids: users.join(","),
    });

    const output: VkUser[] = [];

    for (const user of response) {
      const newUser = new VkUser().fromJSON(user);
      newUser.photo200 = newUser.photo200.replaceAll("vk.com", "vk.ru");
      output.push(newUser);
    }

    return output;
  }

  public async getGroupsInfo(groups: number[]): Promise<VkGroup[]> {
    if (groups.length === 0) {
      return [];
    }

    const response = await this.callMethod("execute.getGroupsIdentity", {
      group_ids: groups.join(","),
    });

    const output: VkGroup[] = [];

    for (const group of response) {
      const newGroup = new VkGroup().fromJSON(group);
      newGroup.photo200 = newGroup.photo200.replaceAll("vk.com", "vk.ru");
      output.push(newGroup);
    }

    return output;
  }

  public async getGroupsMembersCount(
    groups: number[]
  ): Promise<VkMembersCount[]> {
    if (groups.length === 0) {
      return [];
    }

    // магия на банч по 12
    const bunched = Array.from(
      { length: Math.ceil(groups.length / 12) },
      (_, i) => groups.slice(i * 12, i * 12 + 12)
    );

    const result: VkMembersCount[] = [];

    for (const groupBunch of bunched) {
      const response = await this.callMethod("execute.newGetMembersInGroups", {
        groups: groupBunch.join(","),
      });

      for (const group of response) {
        result.push(new VkMembersCount().fromJSON(group));
      }
    }

    return result;
  }
}
