import {
  jsonObject,
  SnakeCaseNamingStrategy,
  Serializable,
  jsonProperty,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class GetUpdates extends Serializable {
  @jsonProperty(Number)
  tickets: number = 0;

  @jsonProperty(Number)
  watchdog: number = 0;

  @jsonProperty(Number)
  requests: number = 0;
}

export class UtilsCategory extends ApiCategory {
  public async getUpdates(): Promise<GetUpdates> {
    return GetUpdates.fromJSON(await this.get("utils/get_updates"));
  }
}
