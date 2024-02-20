import {
  Serializable,
  SnakeCaseNamingStrategy,
  jsonObject,
  jsonProperty,
} from "ts-serializable";
import { ApiCategory } from "./apiCategory";

export enum TicketType {
  question = "question",
  newFeature = "new_feature",
}

export enum TicketStatus {
  unreviewed = "unreviewed",
  inReview = "in_review",
  closed = "closed",
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class TicketMessage extends Serializable {
  @jsonProperty(Boolean)
  authorAdmin: boolean = false;

  @jsonProperty(String)
  messageText: string = "";

  @jsonProperty([String])
  attachments: string[] = [];

  @jsonProperty(Date)
  added: Date = new Date();
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class Ticket extends Serializable {
  @jsonProperty(Number)
  ticketId: number = -1;

  @jsonProperty(String)
  type: TicketType = TicketType.question;

  @jsonProperty(String)
  status: TicketStatus = TicketStatus.unreviewed;

  @jsonProperty(Number)
  issuer: number = -1;

  @jsonProperty([TicketMessage])
  dialog: TicketMessage[] = [];

  @jsonProperty(Date)
  opened: Date = new Date();

  @jsonProperty(Date, null)
  closed: Date | null = null;
}

@jsonObject({ namingStrategy: new SnakeCaseNamingStrategy() })
export class TicketShort extends Serializable {
  @jsonProperty(Number)
  ticketId: number = -1;

  @jsonProperty(String)
  type: TicketType = TicketType.question;

  @jsonProperty(String)
  status: TicketStatus = TicketStatus.unreviewed;

  @jsonProperty(Number)
  issuer: number = -1;

  @jsonProperty(Boolean)
  needsAttention: boolean = false;

  @jsonProperty(String)
  topic: string = "";

  @jsonProperty(Date)
  opened: Date = new Date();
}

export class TicketsCategory extends ApiCategory {
  private sort(list: any[]) {
    return list.sort((a, b) => b.opened.getTime() - a.opened.getTime());
  }

  public async getTickets() {
    const response = await this.get("tickets/get");
    const output: TicketShort[] = [];
    for (const ticket of response) {
      output.push(TicketShort.fromJSON(ticket));
    }

    this.sort(output);
    return output;
  }

  public async getTicket(ticketId: number) {
    return Ticket.fromJSON(await this.get(`tickets/ticket/${ticketId}`));
  }

  public async updateStatus(
    ticketId: number,
    status: TicketStatus,
    silent: boolean = false
  ) {
    let targetUrl = `tickets/ticket/${ticketId}/update/status`;
    if (silent) {
      targetUrl += "?silent=true";
    }

    return await this.post(targetUrl, {
      status: status,
    });
  }

  public async addMessage(
    ticketId: number,
    messageText: string,
    asAdmin: boolean = true
  ) {
    return await this.post(`tickets/ticket/${ticketId}/update/add_message`, {
      author_admin: asAdmin,
      message_text: messageText,
    });
  }
}
