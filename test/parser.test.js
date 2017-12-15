import { DOMParser } from 'xmldom';
import { expect } from 'chai';
import sinon from 'sinon';

import { parse, ERR_INVALID_XML } from '../src/parser';

describe('XML parser', () => {
  let sandbox;

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('parse', () => {
    it('should export a function', () => {
      expect(parse).to.be.a('function');
    });

    it('should return `null` when no text is passed', () => {
      expect(parse()).to.be.null;
      expect(parse('foo')).not.to.be.null;
    });

    it('should parse XML from a string', () => {
      const mockXMLTree = {};
      sandbox.stub(DOMParser.prototype, 'parseFromString').returns(mockXMLTree);
      expect(parse('foo')).to.equal(mockXMLTree);
      sinon.assert.calledWith(DOMParser.prototype.parseFromString, 'foo', 'text/xml');
    });

    describe('When an invalid XML string is passed', () => {
      beforeEach(() => {
        sandbox.stub(console, 'warn');
        sandbox.stub(DOMParser.prototype, 'parseFromString').throws(new Error('boom'));
      });

      it('should return `null`', () => {
        expect(parse('foo')).to.be.null;
      });

      it('should log a warning', () => {
        parse('foo');
        sinon.assert.calledWith(console.warn, ERR_INVALID_XML);
      });
    });
  });
});
