import {
  jsonName,
  jsonObject,
  jsonProperty,
  Serializable,
  SnakeCaseNamingStrategy,
} from "ts-serializable";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class VkUser extends Serializable {
  @jsonProperty(Number)
  id: number = -1;

  @jsonProperty(String)
  firstName: string = "";

  @jsonProperty(String)
  lastName: string = "";

  @jsonName("photo_200")
  @jsonProperty(String)
  photo200: string = "";
}
