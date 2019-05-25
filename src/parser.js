import { DOMParser } from 'xmldom';

export const ERR_INVALID_XML = 'XMLToReact: Unable to parse invalid XML input. Please input valid XML.';

const throwError = (m) => { throw new Error(m); };

const parser = new DOMParser({
  errorHandler: throwError,
  fatalError: throwError,
  warning: throwError,
});


/**
 * Parse an xml string
 *
 * @param {string} xml - xml to convert
 * @returns {object} - xml tree
 * @public
 */
export function parse(xml) {
  if (typeof xml !== 'string') {
    return null;
  }

  try {
    return parser.parseFromString(xml, 'text/xml');
  } catch (e) {
    console.warn(ERR_INVALID_XML); // eslint-disable-line no-console
  }

  return null;
}
