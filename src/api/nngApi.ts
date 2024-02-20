import "reflect-metadata";
import { API_URL, LOCAL_URL } from "../constants";
import { GroupsCategory } from "./categories/groupsCategory";
import { RequestsCategory } from "./categories/requestsCategory";
import { TicketsCategory } from "./categories/ticketsCategory";
import { UsersCategory } from "./categories/usersCategory";
import { WatchdogCategory } from "./categories/watchdogCategory";
import { CommentCategory as CommentsCategory } from "./categories/commentsCategory";
import { UtilsCategory } from "./categories/utilsCategory";

export class NngApi {
  groups: GroupsCategory;
  users: UsersCategory;
  requests: RequestsCategory;
  watchdog: WatchdogCategory;
  tickets: TicketsCategory;
  comments: CommentsCategory;
  utils: UtilsCategory;

  constructor(token: string) {
    this.groups = new GroupsCategory(token);
    this.users = new UsersCategory(token);
    this.requests = new RequestsCategory(token);
    this.watchdog = new WatchdogCategory(token);
    this.tickets = new TicketsCategory(token);
    this.comments = new CommentsCategory(token);
    this.utils = new UtilsCategory(token);
  }

  public static async authInVk(code: string): Promise<Record<string, any>> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/vk_auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          original_redirect_uri: `${LOCAL_URL}/auth`,
        }),
      });
    } catch (e) {
      throw e;
    }

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  }

  public static async whoAmI(token: string): Promise<Record<string, any>> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/auth/whoami`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
    } catch (e) {
      throw e;
    }

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  }
}
