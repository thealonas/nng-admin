import {
  Serializable,
  SnakeCaseNamingStrategy,
  jsonObject,
  jsonProperty,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";
import { BanPriority } from "./usersCategory";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Watchdog extends Serializable {
  @jsonProperty(Number)
  watchdogId: number = -1;

  @jsonProperty(Number, null)
  intruder: number | null = null;

  @jsonProperty(Number, null)
  victim: number | null = null;

  @jsonProperty(Number)
  groupId: number = 0;

  @jsonProperty(String)
  priority: BanPriority = BanPriority.green;

  @jsonProperty(Date)
  date: Date = new Date();

  @jsonProperty(Boolean)
  reviewed: boolean = false;
}

export class WatchdogCategory extends ApiCategory {
  public async getLog(logId: number): Promise<Watchdog> {
    const response = await this.get(`watchdog/get/${logId}`);
    return Watchdog.fromJSON(response);
  }

  public async addInfo(
    logId: number,
    intruder: number | null = null,
    groupId: number | null = null,
    victim: number | null = null,
    date: Date | null = null,
    reviewed: boolean | null = null
  ) {
    return this.post(`watchdog/update/${logId}`, {
      intruder: intruder,
      group_id: groupId,
      victim: victim,
      date: date ? date.toLocaleDateString("ru-RU") : null,
      reviewed: reviewed,
    });
  }

  public async getLogs(): Promise<Watchdog[]> {
    const response = await this.get("watchdog/list");

    const output: Watchdog[] = [];

    for (const log of response) {
      output.push(Watchdog.fromJSON(log));
    }

    return output;
  }
}
