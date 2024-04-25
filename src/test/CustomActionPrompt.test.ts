import { CustomActionPrompt } from '../prompt-manage/custom-action/CustomActionPrompt';
import { InteractionType } from "../custom-action/InteractionType";
import { ChatRole } from "../llm-provider/ChatMessage";
import { CustomActionType } from "../prompt-manage/custom-action/CustomActionType";

describe('CustomActionPrompt', () => {
  describe('fromContent', () => {
    it('should parse content with front-matter and chat messages', () => {
      const content = `---
interaction: AppendCursorStream
priority: 1
key1: value1
key2: value2
---
\`\`\`system\`\`\`
Chat message 1
\`\`\`user\`\`\`
Chat message 2
`;
      const expectedPrompt = new CustomActionPrompt(
        undefined,
        InteractionType.AppendCursorStream,
        1,
        CustomActionType.Default,
        {
          key1: 'value1',
          key2: 'value2',
        },
        [
          { role: ChatRole.System, content: 'Chat message 1\n' },
          { role: ChatRole.User, content: 'Chat message 2\n\n' },
        ],
      );
      const prompt = CustomActionPrompt.fromContent(content);
      expect(prompt).toEqual(expectedPrompt);
    });

    it('should handle invalid content', () => {
      const content = 'Invalid content';
      const expectedPrompt = new CustomActionPrompt(
        undefined,
        InteractionType.AppendCursorStream,
        0,
        CustomActionType.Default,
        {},
        [{ role: ChatRole.User, content }],
      );

      const prompt = CustomActionPrompt.fromContent(content);
      expect(prompt).toEqual(expectedPrompt);
    });
  });
});
