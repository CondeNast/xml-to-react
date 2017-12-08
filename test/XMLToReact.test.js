import React from 'react';
import { expect } from 'chai';
import { createSandbox  } from 'sinon';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import XMLToReact from '../src/XMLToReact';
import { visitNode } from '../src/helpers';

configure({ adapter: new Adapter() });

describe('XMLToReact class ', () => {

  function TestComponent(props) {
    const classes = props.fancy ? 'test fancy' : 'test';
    return <div className={classes}>{props.children}</div>;
  };

  const converters = {
    'test-tag': (attributes) => ({
      type: TestComponent,
      props: attributes
    }),
    'fancy-test-tag': (attributes, data) => ({
      type: TestComponent,
      props: Object.assign({}, attributes, { fancy: true })
    })
  };

  const mockData = {
    name: 'Simba',
    job: 'King'
  };

  it('exports a module', function () {
    expect(XMLToReact).to.be.a('function');
  });

  describe('#constructor', function () {

    it('returns an XMLToReact instance', function () {
      expect(new XMLToReact(converters)).to.be.an.instanceof(XMLToReact);
    });

    [123, false, true, {}, [], null, undefined]
      .forEach(function (badConverters) {
        it(`returns an XMLToReact instance with invalid converters (${typeof badConverters} -- ${badConverters})`, function () {
          const fn = () => new XMLToReact(badConverters);
          expect(fn).to.throw(Error);
        });
      });

  });

  describe('#convert', function () {

    let sandbox = createSandbox();
    let visitNodeSpy;

    before(function () {
      visitNodeSpy = sandbox.spy(visitNode);
    });

    beforeEach(function () {
      sandbox.reset();
    });

    after(function () {
      sandbox.restore();
    });

    [123, false, true, {}, [], null, undefined]
      .forEach(function (badXML) {

        it(`returns null when XML input is not a string (${typeof badXML} -- ${badXML})`, function () {
          const xmltoreact = new XMLToReact(converters);
          const tree = xmltoreact.convert(badXML);

          expect(tree).to.be.null;
          expect(visitNodeSpy.called).to.be.false;
        });

      });

    ['', '< test-tag />', '</test-tag', '<1234>', '<test-tag']
      .forEach(function (badXML) {

        it(`returns null tree when input is invalid XML "${badXML}"`, function () {
          const xmltoreact = new XMLToReact(converters);
          const tree = xmltoreact.convert(badXML);

          expect(tree).to.be.null;
          expect(visitNodeSpy.called).to.be.false;
        });

      });

    it('returns null for with valid XML tags which do not have an associated converter', function () {
      const xmltoreact = new XMLToReact(converters);
      const mockXML = '<fake-tag />';

      const tree = xmltoreact.convert(mockXML);

      expect(tree).to.be.null;
    });

    it('returns a React element tree with valid, simple XML without data', function () {
      const xmltoreact = new XMLToReact(converters);
      const mockXML = '<test-tag />';

      const tree = xmltoreact.convert(mockXML);

      expect(tree).not.to.be.null;

      const wrapper = shallow(tree);

      expect(wrapper.exists()).to.be.true;
      expect(wrapper.find('.test')).to.have.length(1);
    });


    it('returns a React element tree with valid, complex XML without data', function () {
      const xmltoreact = new XMLToReact(converters);
      const mockXML = `
        <test-tag>
          <fancy-test-tag />
        </test-tag>
      `;

      const tree = xmltoreact.convert(mockXML);

      expect(tree).not.to.be.null;

      const wrapper = shallow(tree);

      expect(wrapper.exists()).to.be.true;
      expect(wrapper.find('.test > [fancy]')).to.have.length(1);
    });

    it('returns a React element tree with valid XML and valid data', function () {
      const xmltoreact = new XMLToReact(converters);
      const mockXML = '<test-tag />';
      const tree = xmltoreact.convert(mockXML, mockData);

      expect(tree).not.to.be.null;

      const wrapper = shallow(tree);

      expect(wrapper.exists()).to.be.true;
      expect(wrapper.find('.test')).to.have.length(1);
    });

    [123, false, true, {}, [], null, undefined]
      .forEach(function (badData) {
        it(`returns a React element tree with valid XML, but with invalid data ${typeof badData} -- ${badData}`, function () {
          const xmltoreact = new XMLToReact(converters);
          const mockXML = '<test-tag />';
          const tree = xmltoreact.convert(mockXML, badData);

          expect(tree).not.to.be.null;

          const wrapper = shallow(tree);

          expect(wrapper.exists()).to.be.true;
          expect(wrapper.find('.test')).to.have.length(1);
        });
      });

  });

});

