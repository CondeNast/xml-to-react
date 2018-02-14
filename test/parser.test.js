import { parse, ERR_INVALID_XML } from '../src/parser';

describe('XML parser', () => {
  describe('parse', () => {
    it('should export a function', () => {
      expect(typeof parse).toBe('function');
    });

    it('should return `null` when no text is passed', () => {
      expect(parse()).toEqual(null);
      expect(parse('foo')).not.toEqual(null);
    });

    it('should parse XML from a string', () => {
      expect(parse('foo')).toMatchObject({ firstChild: { data: 'foo' } });
    });

    describe('When an invalid XML string is passed', () => {
      beforeAll(() => {
        global.console.warn = jest.fn();
      });
      it('should return `null`', () => {
        expect(parse('<foo>')).toEqual(null);
      });
      it('should log a warning', () => {
        parse('<foo>');
        expect(global.console.warn).toHaveBeenCalledWith(ERR_INVALID_XML);
      });
    });
  });
});
