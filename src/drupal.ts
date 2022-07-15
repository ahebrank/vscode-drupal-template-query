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
  /**
   * Try to get entity info from a template filename.
   */
  static parseTemplate(filename: string): Entity|null {
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
  static getBaseEndpoint(): string {
    return "http://localhost:9000/jsonapi";
  }

  /**
   * Get token.
   * @todo: this should be extension configuration.
   */
   static getApiKey(): string {
    const user = "admin";
    const key = "YTR5Ie4J3tFcIfbhaglWFkEnKjLtZRTRi0dssVPIxYnbnnbheT96ZgdYKMTIc70z";
    const b = Buffer.from(user + ":" + key);
    return b.toString('base64');
  }

  /**
   * Run a fetch, get JSON.
   * @todo: authentication layer?
   */
  static async jsonApiQuery(endpoint: string) {
    const response = await fetch(this.getBaseEndpoint() + endpoint, {
      headers: {
        authorization: 'Basic ' + this.getApiKey(),
      },
    });
    return await response.json();
  }

  /**
   * Retrieve field info for an entity.
   */
  static async getEntityFieldInfo(e: Entity) {
    const endpoint = '/field_config/field_config' +
      `?filter[entity_type]=${e.type}` +
      `&filter[bundle]=${e.bundle}`;
    return await this.jsonApiQuery(endpoint);
  }

  static async getEntityDisplayInfo(e: Entity) {
    const endpoint = '/entity_view_display/entity_view_display' +
      `?filter[targetEntityType]=${e.type}` +
      `&filter[bundle]=${e.bundle}` +
      `&filter[mode]=${e.viewmode}`;
    return await this.jsonApiQuery(endpoint);
  }
}