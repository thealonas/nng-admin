import {
  jsonObject,
  jsonProperty,
  Serializable,
  SnakeCaseNamingStrategy,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

export enum RequestType {
  unblock = "unblock",
  complaint = "complaint",
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Request extends Serializable {
  @jsonProperty(Number)
  requestId: number = -1;

  @jsonProperty(String)
  requestType: RequestType = RequestType.unblock;

  @jsonProperty(Date)
  createdOn: Date = new Date();

  @jsonProperty(Number)
  userId: number = 0;

  @jsonProperty(Number, null)
  intruder: number | null = null;

  @jsonProperty(String)
  userMessage: string = "";

  @jsonProperty(String, null)
  vkComment: string | null = null;

  @jsonProperty(String, null)
  answer: string | null = null;

  @jsonProperty(Boolean)
  decision: boolean = false;

  @jsonProperty(Boolean)
  answered: boolean = false;
}

export class RequestsCategory extends ApiCategory {
  public async listRequests(): Promise<Request[]> {
    const response = await this.get("requests/list");
    const output: Request[] = [];

    for (let request of response) {
      output.push(Request.fromJSON(request));
    }

    return output;
  }

  public async getRequest(requestId: number): Promise<Request> {
    const response = await this.get(`requests/request/${requestId}`);
    return Request.fromJSON(response);
  }

  public async changeRequestStatus(
    requestId: number,
    decision: boolean,
    answered: boolean = true,
    answer: string = ""
  ) {
    return await this.post(`requests/update/${requestId}`, {
      answer: answer,
      decision: decision,
      answered: answered,
    });
  }

  public async changeIntruder(requestId: number, newIntruder: number) {
    const response = await this.post(`requests/change_intruder/${requestId}`, {
      new_intruder: newIntruder,
    });
    return Request.fromJSON(response);
  }
}
