import { API_URL } from "../../constants";

export class ApiCategory {
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(token: string, apiUrl: string | null = null) {
    this.token = token;

    if (apiUrl == null) {
      this.apiUrl = API_URL;
    } else {
      this.apiUrl = apiUrl;
    }
  }

  private throwIfError(response: Response) {
    if (!response.ok) {
      throw response;
    }
  }

  protected async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      },
    });
    this.throwIfError(response);
    return await response.json();
  }

  protected async post(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      },
      body: JSON.stringify(body),
    });
    this.throwIfError(response);
    return await response.json();
  }

  protected async put(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.apiUrl}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.token,
      },
      body: JSON.stringify(body),
    });
    this.throwIfError(response);
    return await response.json();
  }
}
