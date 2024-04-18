import { expect } from 'chai';
import { TemplateRoleSplitter } from "../prompt-manage/team-prompts/TemplateRoleSplitter";

describe('TemplateRoleSplitter', () => {
  it('should split a template role string into sections', () => {
    const input = `
\`\`\`system\`\`\`
You are a helpful assistant.

\`\`\`user\`\`\`
$\{question}
`;
    const expectedOutput = {
      system: '\nYou are a helpful assistant.\n\n',
      user: '${question}\n\n',
    };
    const result = TemplateRoleSplitter.split(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should treat the entire input as a single section if it does not start with "```" and end with "```"', () => {
    const input = 'This is a message';
    const expectedOutput = {
      user: 'This is a message',
    };
    const result = TemplateRoleSplitter.split(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should handle multiple sections correctly', () => {
    const input = `
\`\`\`system\`\`\`
You are a helpful assistant.

\`\`\`user\`\`\`
$\{question}

\`\`\`system\`\`\`
Thank you for using our system.
`;
    const expectedOutput = {
      system: 'Thank you for using our system.\n\n',
      user: '${question}\n\n',
    };
    const result = TemplateRoleSplitter.split(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it('should handle empty sections', () => {
    const input = `
\`\`\`system\`\`\`

\`\`\`user\`\`\`
$\{question}
`;
    const expectedOutput = {
      system: '\n\n',
      user: '${question}\n\n',
    };
    const result = TemplateRoleSplitter.split(input);
    expect(result).to.deep.equal(expectedOutput);
  });
});
