import { DOMParser } from 'xmldom';
import { validateConverters, visitNode } from './helpers';

const ERR_INVALID_XML = 'XMLToReact: Unable to parse invalid XML input. Please input valid XML.';
const ERR_INVALID_CONVERTERS = 'XMLToReact: Invalid value for converter map argument. Please use an object with functions as values.';

const throwError = (m) => { throw new Error(m); };

const parser = new DOMParser({
  errorHandler: throwError,
  fatalError: throwError,
  warning: throwError,
});


/*
 * Class representing an XML to React transformer.
 * @public
 */
export default class XMLToReact {
  /*
   * Create a XML to React converter.
   * @param {Object} converters - a mapping of tag names to a function
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


  /*
   * Create a XML to React converter.
   * @param {string} xml - xml to convert
   * @param {Object} [data] - optional data to assist in conversion
   * @returns {Object} - React element tree
   * @public
   */
  convert(xml, data) {
    if (typeof xml !== 'string') {
      return null;
    }

    let tree;

    try {
      tree = parser.parseFromString(xml, 'text/xml');
    } catch (e) {
      console.warn(ERR_INVALID_XML);
      return null;
    }

    return visitNode(tree.documentElement, 0, this.converters, data);
  }
}

