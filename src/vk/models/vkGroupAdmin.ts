import {
  jsonObject,
  jsonProperty,
  Serializable,
  SnakeCaseNamingStrategy,
} from "ts-serializable";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class VkGroupAdmin extends Serializable {
  @jsonProperty(Number)
  id: number = -1;

  @jsonProperty(String)
  firstName: string = "";

  @jsonProperty(String)
  lastName: string = "";

  @jsonProperty(String)
  role: string = "";
}
