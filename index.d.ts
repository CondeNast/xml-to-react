/**
 * Create a XML to React converter.
 *
 * @param {object} converters - a mapping of tag names to a function
 *                              returning the desired mapping.
 * @public
 */
declare class XMLToReact {
  constructor(converters: any);

  /**
   * Create a XML to React converter.
   *
   * @param {string} xml - xml to convert
   * @param {object} [data] - optional data to assist in conversion
   * @returns {object} - React element tree
   * @public
   */
  public convert(xml: string, data?: any): any;
}

export = XMLToReact;
