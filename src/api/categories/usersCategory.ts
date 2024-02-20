import {
  Serializable,
  SnakeCaseNamingStrategy,
  jsonObject,
  jsonProperty,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class TrustInfo extends Serializable {
  @jsonProperty(Number)
  trust: number = 0;

  @jsonProperty(Number)
  toxicity: number = 0;

  @jsonProperty(Date, null)
  registrationDate: Date | null = null;

  @jsonProperty(Date)
  nngJoinDate: Date = new Date();

  @jsonProperty(Boolean)
  oddGroups: boolean = false;

  @jsonProperty(Boolean)
  closedProfile: boolean = false;

  @jsonProperty(Boolean)
  hasPhoto: boolean = false;

  @jsonProperty(Boolean)
  hasWallPosts: boolean = false;

  @jsonProperty(Boolean)
  hasFriends: boolean = false;

  @jsonProperty(Boolean)
  verified: boolean = false;

  @jsonProperty(Boolean)
  joinedTestGroup: boolean = false;

  @jsonProperty(Boolean)
  joinedMainGroup: boolean = false;

  @jsonProperty(Boolean)
  hasViolation: boolean = false;

  @jsonProperty(Boolean)
  hadViolation: boolean = false;

  @jsonProperty(Boolean)
  hasWarning: boolean = false;

  @jsonProperty(Boolean)
  hadWarning: boolean = false;

  @jsonProperty(Boolean)
  activism: boolean = false;

  @jsonProperty(Boolean)
  usedNng: boolean = false;

  @jsonProperty(Boolean)
  donate: boolean = false;

  @jsonProperty(Date)
  lastUpdated: Date = new Date();
}

export enum ViolationType {
  warned = "warned",
  banned = "banned",
}

export enum BanPriority {
  green = "green",
  teal = "teal",
  orange = "orange",
  red = "red",
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Violation extends Serializable {
  @jsonProperty(String)
  type: ViolationType = ViolationType.warned;

  @jsonProperty(Number, null)
  groupId: number | null = null;

  @jsonProperty(String, null)
  priority: BanPriority | null = null;

  @jsonProperty(Number, null)
  complaint: number | null = null;

  @jsonProperty(Number, null)
  ref: number | null = null;

  @jsonProperty(Boolean, null)
  active: boolean | null = null;

  @jsonProperty(Date, null)
  date: Date | null = null;

  public static priorityToColor(priority: BanPriority) {
    switch (priority) {
      case BanPriority.green:
        return "green";
      case BanPriority.teal:
        return "teal";
      case BanPriority.orange:
        return "orange";
      case BanPriority.red:
        return "red";
      default:
        return "blue";
    }
  }

  public static priorityToStringifiedReason(priority: BanPriority) {
    switch (priority) {
      case BanPriority.green:
        return "Взаимодействие со стеной, историями или публикация рекламы";
      case BanPriority.teal:
        return "Спам, флуд или нарушение норм платформы ВКонтакте";
      case BanPriority.orange:
        return "Взаимодействие с оформлением групп";
      case BanPriority.red:
        return "Взаимодействие с чёрным списком, списком участников или создание сайта из сообщества";
      default:
        return "Неизвестный";
    }
  }

  public static priorityToTitle(priority: BanPriority) {
    switch (priority) {
      case BanPriority.green:
        return "зёленый";
      case BanPriority.teal:
        return "бирюзовый";
      case BanPriority.orange:
        return "оранжевый";
      case BanPriority.red:
        return "красный";
      default:
        return "неизвестный";
    }
  }
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class User extends Serializable {
  @jsonProperty(Number)
  userId: number = 0;

  @jsonProperty(String)
  name: string = "";

  @jsonProperty(Boolean)
  admin: boolean = false;

  @jsonProperty(TrustInfo)
  trustInfo: TrustInfo = new TrustInfo();

  @jsonProperty(Number, null)
  invitedBy: number | null = null;

  @jsonProperty(Date)
  joinDate: Date = new Date();

  @jsonProperty([Violation])
  violations: Violation[] = [];

  @jsonProperty([Number])
  groups: number[] = [];
}

export class UsersCategory extends ApiCategory {
  public async getUser(userId: number): Promise<User> {
    const user = await this.get(`users/user/${userId}`);
    return User.fromJSON(user);
  }

  public async searchUsers(query: string): Promise<User[]> {
    const users = await this.get(`users/search?query=${query}`);
    let answer: User[] = [];
    for (let user of users) {
      answer.push(User.fromJSON(user));
    }

    return answer;
  }

  public async updateUser(user: User) {
    return await this.post(`users/update/${user.userId}`, {
      name: user.name,
      admin: user.admin,
      groups: user.groups,
      activism: user.trustInfo.activism,
      donate: user.trustInfo.donate,
    });
  }

  public async unbanUser(userId: number) {
    return await this.post(`users/unban/${userId}`, null);
  }

  public async fireEditor(userId: number, groupId: number) {
    return await this.post(`users/fire/${userId}`, { group_id: groupId });
  }

  public async restoreEditor(userId: number, groupId: number) {
    return await this.post(`users/restore/${userId}`, { group_id: groupId });
  }

  public async calculateTrust(userId: number) {
    return await this.get(`users/calculate_trust/${userId}`);
  }

  public async addViolation(
    userId: number,
    violation: Violation,
    immediate: boolean = true,
  ) {
    const date = violation.date?.toISOString().split("T")[0] ?? "";
    const data: Record<any, any> = {
      type: violation.type,
      group_id: violation.groupId,
      priority: violation.priority,
      complaint: violation.complaint,
      ref: violation.ref,
      active: violation.active,
      date: date,
    };

    return await this.post(
      `users/add_violation/${userId}?immediate=${immediate ? "true" : "false"}`,
      data,
    );
  }
}
