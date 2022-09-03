import fetch from 'node-fetch';

export class TokenApi {

  private baseUrl: string;
  private token: string;

  constructor (baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Run a fetch, get JSON.
   * @todo: authentication layer?
   */
  public async jsonApiQuery(endpoint: string) {
    const response = await fetch(this.baseUrl + endpoint, {
      headers: {
        authorization: this.token,
      },
    });
    return await response.json();
  }

}