import {
  jsonName,
  jsonObject,
  jsonProperty,
  Serializable,
  SnakeCaseNamingStrategy,
} from "ts-serializable";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class VkGroup extends Serializable {
  @jsonProperty(Number)
  id: number = -1;

  @jsonProperty(String)
  name: string = "";

  @jsonProperty(String)
  screenName: string = "";

  @jsonName("photo_200")
  @jsonProperty(String)
  photo200: string = "";
}
