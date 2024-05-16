/* eslint-disable curly */
import OpenAI from "openai";
import ora from "ora";
import colors from "ansi-colors";
import onExit from "on-exit";

import enquirer from "enquirer";

import { PORT, OLLAMA_CHAT_MODELS } from "../src/environment.mjs";

const AI_MESSAGE_FORMAT = `${colors.blueBright("⚉")} 助手 ${colors.dim(
  "·"
)} %s`;
const MSG_ERROR_FORMAT = `${colors.redBright("✘")} 系统 ${colors.dim("·")} %s`;

const banner = `
  ######   :::        :::            :::     ::::    ::::      :::     
:+:    :+: :+:        :+:          :+: :+:   +:+:+: :+:+:+   :+: :+:   
+:+    +:+ +:+        +:+         +:+   +:+  +:+ +:+:+ +:+  +:+   +:+  
+#+    +:+ +#+        +#+        +#++:++#++: +#+  +:+  +#+ +#++:++#++: 
+#+    +#+ +#+        +#+        +#+     +#+ +#+       +#+ +#+     +#+ 
#+#    #+# #+#        #+#        #+#     #+# #+#       #+# #+#     #+# 
  ######   ########## ########## ###     ### ###       ### ###     ### 
                                            

欢迎使用 OLLAMA Chat 服务
=====================
`;

type Setting = {
  baseURL: string;
  apiKey: string;
  model: string;
  system: string;
  stream: boolean;
};

async function chat(setting: Setting) {
  const openai = new OpenAI({
    baseURL: setting.baseURL,
    apiKey: setting.apiKey,
  });

  const history: OpenAI.ChatCompletionMessageParam[] = [];

  while (true) {
    const { prompt } = await enquirer.prompt<{ prompt: string }>({
      type: "text",
      name: "prompt",
      message: "你说",
      required: true,
      // @ts-ignore
      footer() {
        return colors.dim('(输入 "/" 回车，可选择指令)');
      },
    });

    if (prompt === "/") {
      const { command } = await enquirer.prompt<{ command: string }>({
        type: "autocomplete",
        name: "command",
        message: "选择指令",
        choices: ["/new", "/exit"],
      });

      if (command === "/exit") {
        console.clear();
        console.log(AI_MESSAGE_FORMAT, "好的，期待我们下一次相遇！");
        process.exit(0);
      }

      if (command === "/new") {
        history.length = 0;
        console.clear();
        console.log(AI_MESSAGE_FORMAT, "好的，让我们重新开始吧。");
        console.log(" ");
        continue;
      }
    }

    const spinner = ora("✦ Thinking...").start();

    try {
      const completion = await openai.chat.completions.create({
        model: setting.model,
        messages: [
          {
            role: "system",
            content: setting.system,
          },
          ...history,
          { role: "user", content: prompt },
        ],
      });

      spinner.stop();

      const message = completion.choices[0].message.content;

      console.log(AI_MESSAGE_FORMAT, message);
      console.log("");

      history.push(
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: message,
        }
      );
    } catch (error) {
      spinner.stop();
      console.error(MSG_ERROR_FORMAT, colors.red((error as Error).message));
    } finally {
      console.log("");
    }
  }
}

async function main() {
  console.clear();
  console.log(banner);

  const setting = await enquirer.prompt<Setting>([
    {
      name: "baseURL",
      type: "input",
      message: "Base URL",
      initial: `http://localhost:${PORT}`,
    },
    {
      name: "apiKey",
      message: "API Key",
      type: "invisible",
      initial: "sk-xxxxxxx",
    },
    {
      name: "model",
      type: "select",
      message: "Chat Model",
      initial: 0,
      choices: OLLAMA_CHAT_MODELS,
    },
    {
      name: "system",
      type: "input",
      message: "System Message",
      initial: "You are a helpful assistant.",
    },
  ]);

  console.log("");

  chat(setting);
}

main();
