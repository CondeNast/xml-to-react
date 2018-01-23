import { DOMParser } from 'xmldom';
import { isValidElement } from 'react';
import {
  validateConverters,
  getAttributes,
  getChildren,
  visitNode,
} from '../src/helpers';

describe('helpers', () => {
  let parseXML;

  beforeAll(() => {
    // `parseXML` test helper to create XML nodes from strings
    const throwError = (m) => { throw new Error(m); };
    const parser = new DOMParser({
      errorHandler: throwError,
      fatalError: throwError,
      warning: throwError,
    });
    parseXML = xml => parser.parseFromString(xml, 'text/xml');
  });

  describe('validateConverters', () => {
    it('should export a function', () => {
      expect(validateConverters).toEqual(expect.any(Function));
    });

    it('should return `true` if passed an object of only functions', () => {
      const converters = {
        foo: () => {},
        bar: () => {},
        baz: () => {},
      };
      expect(validateConverters(converters)).toEqual(true);
    });

    it('should return `false` if any property is not a function', () => {
      const converters = {
        foo: () => {},
        bar: 5,
        baz: () => {},
      };
      expect(validateConverters(converters)).not.toEqual(true);
    });

    it('should return `false` if passed an empty object', () => {
      expect(validateConverters({})).not.toEqual(true);
      expect(validateConverters([])).not.toEqual(true);
    });

    it('should return `false` if not provided an object', () => {
      expect(validateConverters()).not.toEqual(true);
      expect(validateConverters('hello')).not.toEqual(true);
      expect(validateConverters(5)).not.toEqual(true);
      expect(validateConverters(true)).not.toEqual(true);
      expect(validateConverters(() => {})).not.toEqual(true);
      expect(validateConverters(null)).not.toEqual(true);
    });
  });

  describe('getAttributes', () => {
    it('should export a function', () => {
      expect(getAttributes).toEqual(expect.any(Function));
    });

    it('should return an empty object by default', () => {
      expect(getAttributes()).toEqual({});
    });

    it('should return an empty object by if the node has no attributes', () => {
      expect(getAttributes({})).toEqual({});
      expect(getAttributes({ attributes: null })).toEqual({});
      expect(getAttributes({ attributes: [] })).toEqual({});
    });

    it('should return all attributes from an XML node', () => {
      const { firstChild } = parseXML('<MyNode foo="hello" bar="5" baz="true"/>');

      // @TODO should we expect values to be strings and then be parsed for type, like w/ JSON?
      expect(getAttributes(firstChild)).toEqual({
        foo: 'hello',
        bar: '5',
        baz: 'true',
      });
    });
  });

  describe('getChildren', () => {
    it('should export a function', () => {
      expect(getChildren).toEqual(expect.any(Function));
    });

    it('should return an empty array by default', () => {
      expect(getChildren()).toEqual([]);
      expect(getChildren(null)).toEqual([]);
      expect(getChildren({})).toEqual([]);
    });

    it('should return an empty array if node has no children', () => {
      const { firstChild } = parseXML('<MyNode foo="hello" bar="5" baz="true"/>');
      expect(getChildren(firstChild)).toEqual([]);
    });

    it('should return child nodes as an array', () => {
      const { firstChild } = parseXML('<MyDocument><A>foo</A><B>bar</B><C>baz</C></MyDocument>');
      const { childNodes } = firstChild;
      expect(getChildren(firstChild)).toEqual([
        childNodes[0],
        childNodes[1],
        childNodes[2],
      ]);
    });
  });

  describe('visitNode', () => {
    it('should export a function', () => {
      expect(visitNode).toEqual(expect.any(Function));
    });

    it('should return `null` by default', () => {
      expect(visitNode()).toEqual(null);
    });

    it('should return the value of a text node', () => {
      const { firstChild } = parseXML('hello');
      expect(visitNode(firstChild)).toBe('hello');
    });

    it('should return `null` if no converter is registered by tagName for the given node', () => {
      const converters = {};
      const { firstChild } = parseXML('<a>hello</a>');
      expect(visitNode(firstChild, 0, converters)).toEqual(null);
    });

    it('should return `null` if node has no tagName', () => {
      const { firstChild } = parseXML('<!-- comment here -->');
      expect(visitNode(firstChild, 0, {})).toEqual(null);
    });

    it('should execute a registered converter with attributes and data', () => {
      const converters = {
        a: jest.fn().mockReturnValue({ type: 'foo', props: {} }),
      };
      const data = { foo: 'bar' };
      const { firstChild } = parseXML('<a x="1" y="two">hello</a>');
      visitNode(firstChild, 0, converters, data);
      expect(converters.a.mock.calls.length).toBe(1);
      expect(converters.a.mock.calls[0][0]).toEqual({ x: '1', y: 'two' });
    });

    it('should create a React element with type provided by the converter', () => {
      const converters = {
        a: () => ({ type: 'foo', props: {} }),
      };
      const { firstChild } = parseXML('<a>hello</a>');
      const element = visitNode(firstChild, 0, converters);
      expect(isValidElement(element)).toEqual(true);
      expect(element.type).toBe('foo');
    });

    it('should create a React element with props provided by the converter', () => {
      const converters = {
        a: attrs => ({
          type: 'foo',
          props: {
            keys: Object.keys(attrs),
          },
        }),
      };
      const data = { foo: 'bar' };
      const { firstChild } = parseXML('<a x="1" y="two">hello</a>');
      const element = visitNode(firstChild, 0, converters, data);
      expect(element.props).toEqual({
        children: 'hello',
        keys: ['x', 'y'],
      });
    });

    it('should assign a key prop, given the current child index', () => {
      const converters = {
        a: () => ({ type: 'foo', props: {} }),
      };
      const { firstChild } = parseXML('<a>hello</a>');
      const element = visitNode(firstChild, 55, converters);
      expect(element.key).toBe('55');
    });

    it('should not mutate the props object returned by the converter', () => {
      const props = { foo: 'bar' };
      const converters = {
        a: () => ({ type: 'foo', props }),
      };
      const { firstChild } = parseXML('<a>hello</a>');
      const element = visitNode(firstChild, 55, converters);
      expect(element.props).toEqual({
        foo: 'bar',
        children: 'hello',
      });
      expect(props).toEqual({ foo: 'bar' });
    });

    it('should create a React element with all visited child elements', () => {
      const converters = {
        Animals: () => ({ type: 'ul', props: {} }),
        Cat: () => ({ type: 'li', props: { action: 'purr' } }),
        Dog: () => ({ type: 'li', props: { action: 'wag' } }),
      };
      const { firstChild } = parseXML('<Animals><Dog>Rufus</Dog><Cat>Billy</Cat></Animals>');
      const element = visitNode(firstChild, 0, converters);

      expect(isValidElement(element)).toEqual(true);
      expect(element.type).toEqual('ul');
      expect(element.props.children).toHaveLength(2);
      const [dog, cat] = element.props.children;

      expect(isValidElement(element)).toEqual(true);
      expect(dog.type).toEqual('li');
      expect(dog.props).toEqual({ action: 'wag', children: 'Rufus' });

      expect(isValidElement(element)).toEqual(true);
      expect(cat.type).toEqual('li');
      expect(cat.props).toEqual({ action: 'purr', children: 'Billy' });
    });
  });
});
