import { parse } from './parser';
import { validateConverters, visitNode } from './helpers';

const ERR_INVALID_CONVERTERS = 'XMLToReact: Invalid value for converter map argument. Please use an object with functions as values.';

/**
 * Class representing an XML to React transformer.
 * @public
 */
export default class XMLToReact {
  /**
   * Create a XML to React converter.
   *
   * @param {object} converters - a mapping of tag names to a function
   *                              returning the desired mapping.
   * @public
   */
  constructor(converters) {
    const isValid = validateConverters(converters);
    if (!isValid) {
      throw new Error(ERR_INVALID_CONVERTERS);
    }

    this.converters = converters;
  }


  /**
   * Create a XML to React converter.
   *
   * @param {string} xml - xml to convert
   * @param {object} [data] - optional data to assist in conversion
   * @returns {object} - React element tree
   * @public
   */
  convert(xml, data) {
    if (typeof xml !== 'string') {
      return null;
    }

    const tree = parse(xml);
    if (!tree) {
      return null;
    }

    return visitNode(tree.documentElement, 0, this.converters, data);
  }
}
