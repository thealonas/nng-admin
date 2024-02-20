import {
  jsonObject,
  jsonProperty,
  Serializable,
  SnakeCaseNamingStrategy,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Group extends Serializable {
  @jsonProperty(Number)
  groupId: number = 0;

  @jsonProperty(String)
  screenName: string = "";
}

export class GroupsCategory extends ApiCategory {
  public async getGroups(): Promise<Group[]> {
    const allGroups = await this.get("groups");
    const answer = [];
    for (let group of allGroups) {
      answer.push(Group.fromJSON(group));
    }
    return answer;
  }
}
