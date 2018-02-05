import { expect } from 'chai';
import { isValidElement } from 'react';
import sinon from 'sinon';
import { parse as parseXML } from '../src/parser';
import {
  validateConverters,
  getAttributes,
  getChildren,
  visitNode,
} from '../src/helpers';

describe('helpers', () => {
  describe('validateConverters', () => {
    it('should export a function', () => {
      expect(validateConverters).to.be.a('function');
    });

    it('should return `true` if passed an object of only functions', () => {
      const converters = {
        foo: () => {},
        bar: () => {},
        baz: () => {},
      };
      expect(validateConverters(converters)).to.equal(true);
    });

    it('should return `false` if any property is not a function', () => {
      const converters = {
        foo: () => {},
        bar: 5,
        baz: () => {},
      };
      expect(validateConverters(converters)).to.equal(false);
    });

    it('should return `false` if passed an empty object', () => {
      expect(validateConverters({})).to.equal(false);
      expect(validateConverters([])).to.equal(false);
    });

    it('should return `false` if not provided an object', () => {
      expect(validateConverters()).to.equal(false);
      expect(validateConverters('hello')).to.equal(false);
      expect(validateConverters(5)).to.equal(false);
      expect(validateConverters(true)).to.equal(false);
      expect(validateConverters(() => {})).to.equal(false);
      expect(validateConverters(null)).to.equal(false);
    });
  });

  describe('getAttributes', () => {
    it('should export a function', () => {
      expect(getAttributes).to.be.a('function');
    });

    it('should return an empty object by default', () => {
      expect(getAttributes()).to.eql({});
    });

    it('should return an empty object by if the node has no attributes', () => {
      expect(getAttributes({})).to.eql({});
      expect(getAttributes({ attributes: null })).to.eql({});
      expect(getAttributes({ attributes: [] })).to.eql({});
    });

    it('should return all attributes from an XML node', () => {
      const { firstChild } = parseXML('<MyNode foo="hello" bar="5" baz="true"/>');

      // @TODO should we expect values to be strings and then be parsed for type, like w/ JSON?
      expect(getAttributes(firstChild)).to.eql({
        foo: 'hello',
        bar: '5',
        baz: 'true',
      });
    });
  });

  describe('getChildren', () => {
    it('should export a function', () => {
      expect(getChildren).to.be.a('function');
    });

    it('should return an empty array by default', () => {
      expect(getChildren()).to.eql([]);
      expect(getChildren(null)).to.eql([]);
      expect(getChildren({})).to.eql([]);
    });

    it('should return an empty array if node has no children', () => {
      const { firstChild } = parseXML('<MyNode foo="hello" bar="5" baz="true"/>');
      expect(getChildren(firstChild)).to.eql([]);
    });

    it('should return child nodes as an array', () => {
      const { firstChild } = parseXML('<MyDocument><A>foo</A><B>bar</B><C>baz</C></MyDocument>');
      const { childNodes } = firstChild;
      expect(getChildren(firstChild)).to.eql([
        childNodes[0],
        childNodes[1],
        childNodes[2],
      ]);
    });
  });

  describe('visitNode', () => {
    it('should export a function', () => {
      expect(visitNode).to.be.a('function');
    });

    it('should return `null` by default', () => {
      expect(visitNode()).to.equal(null);
    });

    it('should return the value of a text node', () => {
      const { firstChild } = parseXML('hello');
      expect(visitNode(firstChild)).to.equal('hello');
    });

    it('should return `null` if no converter is registered by tagName for the given node', () => {
      const converters = {};
      const { firstChild } = parseXML('<a>hello</a>');
      expect(visitNode(firstChild, 0, converters)).to.equal(null);
    });

    it('should return `null` if node has no tagName', () => {
      const { firstChild } = parseXML('<!-- comment here -->');
      expect(visitNode(firstChild, 0, {})).to.equal(null);
    });

    it('should execute a registered converter with attributes and data', () => {
      const converters = {
        a: sinon.stub().returns({ type: 'foo', props: {} }),
      };
      const data = { foo: 'bar' };
      const { firstChild } = parseXML('<a x="1" y="two">hello</a>');
      visitNode(firstChild, 0, converters, data);
      sinon.assert.calledWith(converters.a, { x: '1', y: 'two' }, data);
    });

    it('should create a React element with type provided by the converter', () => {
      const converters = {
        a: () => ({ type: 'foo', props: {} }),
      };
      const { firstChild } = parseXML('<a>hello</a>');
      const element = visitNode(firstChild, 0, converters);
      expect(isValidElement(element)).to.equal(true);
      expect(element.type).to.equal('foo');
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
      expect(element.props).to.eql({
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
      expect(element.key).to.equal('55');
    });

    it('should not mutate the props object returned by the converter', () => {
      const props = { foo: 'bar' };
      const converters = {
        a: () => ({ type: 'foo', props }),
      };
      const { firstChild } = parseXML('<a>hello</a>');
      const element = visitNode(firstChild, 55, converters);
      expect(element.props).to.eql({
        foo: 'bar',
        children: 'hello',
      });
      expect(props).to.eql({ foo: 'bar' });
    });

    it('should create a React element with all visited child elements', () => {
      const converters = {
        Animals: () => ({ type: 'ul', props: {} }),
        Cat: () => ({ type: 'li', props: { action: 'purr' } }),
        Dog: () => ({ type: 'li', props: { action: 'wag' } }),
      };
      const { firstChild } = parseXML('<Animals><Dog>Rufus</Dog><Cat>Billy</Cat></Animals>');
      const element = visitNode(firstChild, 0, converters);

      expect(isValidElement(element)).to.equal(true);
      expect(element.type).to.equal('ul');
      expect(element.props.children).to.have.length(2);
      const [dog, cat] = element.props.children;

      expect(isValidElement(dog)).to.equal(true);
      expect(dog.type).to.equal('li');
      expect(dog.props).to.eql({ action: 'wag', children: 'Rufus' });

      expect(isValidElement(cat)).to.equal(true);
      expect(cat.type).to.equal('li');
      expect(cat.props).to.eql({ action: 'purr', children: 'Billy' });
    });
  });
});
