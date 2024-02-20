import {
  Serializable,
  SnakeCaseNamingStrategy,
  jsonObject,
  jsonProperty,
} from "ts-serializable";
import { VkGroupAdmin } from "./vkGroupAdmin";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class VkMembersCount extends Serializable {
  @jsonProperty(Number)
  id: number = -1;

  @jsonProperty(Number)
  members: number = 0;

  @jsonProperty(Number)
  admins: number = 0;

  @jsonProperty([VkGroupAdmin])
  adminItems: VkGroupAdmin[] = [];
}
