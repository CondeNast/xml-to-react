import { createElement } from 'react';

const ERR_INVALID_CONVERTER = 'XMLToReact: Invalid value for converter map argument. Please use an object with functions as values.';


/**
 * Validates a given converters input
 * @param {Object} converters - an object, with functions as values
 * @returns {boolean} - true when converters is valid, and false when it is invalid
 * @private
 */
export function validateConverters(converters) {
  if (typeof converters !== 'object' || !converters) {
    return false;
  }

  const keys = Object.keys(converters);
  const isEmpty = !keys.length;

  if (isEmpty) {
    return false;
  }

  const isFunction = key => (typeof converters[key] === 'function');
  return keys.every(isFunction);
};


/**
 * Gets map of XML node attributes of a given node.
 * @param {Object} node - XML node
 * @returns {Array} - list of children XML nodes
 * @private
 */
export function getAttributes(node) {
  if (!node) {
    return {};
  }

  const { attributes } = node;

  if (!attributes || !attributes.length) {
    return {};
  }

  return Array.from(attributes)
    .reduce((results, attr) => {
      const { name, value } = attr;
      results[name] = value;
      return results;
    }, {});
};


/**
 * Gets list of XML nodes which are the child of a given node.
 * @param {Object} node - XML node
 * @returns {Array} - list of children XML nodes
 * @private
 */
export function getChildren(node) {
  if (!node) {
    return [];
  }

  const { childNodes: children } = node;

  if (!children) {
    return [];
  }

  return children.length ? Array.from(children) : [];
};


/**
 * Visit XML nodes recursively and convert into React elements.
 * @param {Object} node - xml node
 * @param {number} index - Node index to be used as the key
 * @param {Object} converters - Map of XML tag names to component generating functions
 * @param {Object} [data] - Optional data to be passed to coverters
 * @return {Object} React element
 * @private
 */
export function visitNode(node, index, converters, data, onConverterNotFound) {
  if (!node) {
    return null;
  }

  const { tagName, nodeType } = node;

  // if this is a text node
  if (nodeType === 3) {
    return node.nodeValue;
  }

  if (!tagName) {
    return null;
  }

  let converter = converters[tagName];

  if (typeof converter !== 'function') {
    // Allow onConverterNotFound to dictate default behavior
    const handled = onConverterNotFound(node);
    if (handled) {
      return handled;
    }

    // Default converter
    converter = (attributes, data) => ({ type: tagName, props: attributes });
  }

  const attributes = getAttributes(node);
  const { type, props } = converter(attributes, data);
  const newProps = Object.assign({}, { key: index }, props);

  const children = getChildren(node);
  const childElements = children.map((child, childIndex) =>
    visitNode(child, childIndex, converters, data)
  );

  return createElement(type, newProps, ...childElements);
};
