import * as path from 'path';
import { Entity } from './entity';

/**
 * Drupal helper functions.
 */
export class DrupalHandler {

  private drupalApi: ApiInterface;

  constructor (api: ApiInterface) {
    this.drupalApi = api;
  }

  /**
   * Fix names from templates.
   */
  protected fixDashes(name: string): string {
    return name.replace("-", "_");
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
    e.type = this.fixDashes(parts[0]);
    if (parts.length > 1) {
      e.bundle = this.fixDashes(parts[1]);
    }
    if (parts.length > 2) {
      e.viewmode = this.fixDashes(parts[2]);
    }
    else {
      e.viewmode = 'default';
    }
    return e;
  }

  /**
   * Retrieve field info for an entity.
   */
  public async getEntityFieldInfo(e: Entity) {
    const endpoint = '/field_config/field_config' +
      `?filter[entity_type]=${e.type}` +
      `&filter[bundle]=${e.bundle}`;
    return await this.drupalApi.jsonApiQuery(endpoint);
  }

  public async getEntityDisplayInfo(e: Entity) {
    const endpoint = '/entity_view_display/entity_view_display' +
      `?filter[targetEntityType]=${e.type}` +
      `&filter[bundle]=${e.bundle}` +
      `&filter[mode]=${e.viewmode}`;
    return await this.drupalApi.jsonApiQuery(endpoint);
  }
}