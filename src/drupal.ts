import * as path from 'path';
import fetch from 'node-fetch';

/**
 * Storage for information about the template.
 */
export class Entity {
  public type: string | undefined;
  public bundle: string | undefined;
  public viewmode: string | undefined;
}

/**
 * Drupal helper functions.
 */
export class Drupal {

  private baseUrl: string;
  private token: string;

  constructor (baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  /**
   * Try to get entity info from a template filename.
   */
  public parseTemplate(filename: string): Entity|null {
    if (!filename.endsWith('.html.twig')) {
      return null;
    }
    const basename = path.basename(filename, '.html.twig');
    const parts = basename.split('--');
    const e = new Entity;
    e.type = parts[0];
    if (parts.length > 1) {
      e.bundle = parts[1];
    }
    if (parts.length > 2) {
      e.viewmode = parts[2];
    }
    else {
      e.viewmode = 'default';
    }
    return e;
  }

  /**
   * Get Drupal instance host.
   * @todo: this should be extension configuration.
   */
  public getBaseEndpoint(): string {
    return this.baseUrl;
  }

  /**
   * Get token.
   * @todo: this should be extension configuration.
   */
   public getApiKey(): string {
    return this.token;
  }

  /**
   * Run a fetch, get JSON.
   * @todo: authentication layer?
   */
  public async jsonApiQuery(endpoint: string) {
    const response = await fetch(this.getBaseEndpoint() + endpoint, {
      headers: {
        authorization: this.getApiKey(),
      },
    });
    return await response.json();
  }

  /**
   * Retrieve field info for an entity.
   */
  public async getEntityFieldInfo(e: Entity) {
    const endpoint = '/field_config/field_config' +
      `?filter[entity_type]=${e.type}` +
      `&filter[bundle]=${e.bundle}`;
    return await this.jsonApiQuery(endpoint);
  }

  public async getEntityDisplayInfo(e: Entity) {
    const endpoint = '/entity_view_display/entity_view_display' +
      `?filter[targetEntityType]=${e.type}` +
      `&filter[bundle]=${e.bundle}` +
      `&filter[mode]=${e.viewmode}`;
    return await this.jsonApiQuery(endpoint);
  }
}