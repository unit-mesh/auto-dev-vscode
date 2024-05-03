import { expect } from 'chai';
import { GoModParser } from "../../../toolchain-context/buildtool/GoVersionParser";
import { PackageManger } from "../../../toolchain-context/buildtool/_base/PackageManger";

describe('GoModParser', () => {
  let parser: GoModParser;

  beforeEach(() => {
    parser = new GoModParser();
  });

  it('should parse go.mod content correctly', () => {
    const content = `
      module github.com/example/project
      go 1.16
      require (
        github.com/another/example v1.0.0
        github.com/some/other v2.3.4
      )
    `;

    const result = parser.lookupSource(content);

    expect(result).to.have.length(1);
    expect(result[0].version).to.equal('1.16');
    expect(result[0].path).to.equal('go.mod');
    expect(result[0].packageManager).to.equal(PackageManger.GoMod);
    expect(result[0].dependencies).to.have.length(2);

    const [dep1, dep2] = result[0].dependencies;

    expect(dep1.name).to.equal('github.com/another/example');
    expect(dep1.group).to.equal('github.com/another');
    expect(dep1.artifact).to.equal('example');
    expect(dep1.version).to.equal('1.0.0');

    expect(dep2.name).to.equal('github.com/some/other');
    expect(dep2.group).to.equal('github.com/some');
    expect(dep2.artifact).to.equal('other');
    expect(dep2.version).to.equal('2.3.4');
  });
});
