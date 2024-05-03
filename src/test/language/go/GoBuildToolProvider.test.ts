import { goVersionParser } from "../../../toolchain-context/buildtool/go/GoVersionParser";

describe('GoSupport', () => {
  describe('goVersionParser', () => {
    it('should return the correct version when the input string is valid', () => {
      const stdout = 'go version go1.21.1 darwin/amd64';
      const result = goVersionParser(stdout);
      expect(result).to.equal('1.21.1');
    });

    it('should return an empty string when the input string does not contain a version', () => {
      const stdout = 'go version darwin/amd64';
      const result = goVersionParser(stdout);
      expect(result).to.equal('');
    });

    it('should return an empty string when the input string is empty', () => {
      const stdout = '';
      const result = goVersionParser(stdout);
      expect(result).to.equal('');
    });
  });
});
