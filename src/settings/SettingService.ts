import vscode from "vscode";
import { LlmConfig } from "./LlmConfig";

export class SettingService {
  private static instance_: SettingService;

  private config: vscode.WorkspaceConfiguration;
  private configChangeEventEmitter: vscode.EventEmitter<void>;
  onDidChange: vscode.Event<void>;

  private disposables: vscode.Disposable[] = [];

  private constructor() {
    this.config = vscode.workspace.getConfiguration("autodev");

    this.configChangeEventEmitter = new vscode.EventEmitter<void>();
    this.onDidChange = this.configChangeEventEmitter.event;

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("autodev")) {
          this.config = vscode.workspace.getConfiguration("autodev");
          this.configChangeEventEmitter.fire();
        }
      })
    );
  }

  public static instance(): SettingService {
    if (!SettingService.instance_) {
      SettingService.instance_ = new SettingService();
    }

    return SettingService.instance_;
  }

  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  get<T>(selection: string, defaultValue?: T): T | undefined {
    if (defaultValue) {
      return this.config.get(selection, defaultValue);
    }

    return this.config.get(selection);
  }

  getLLMProviderConfig(provider: "anthropic" | "openai") {}

  customPromptsDir(): string {
    const config = this.config;

    const customDir = config.get<string>("prompts.customDir");

    if (!customDir) {
      return config.get<string>("customPromptDir", "prompts");
    }

    return customDir;
  }

  isEnableRename(): boolean {
    const config = this.config;
    const enableRenameSuggestion = config.get<boolean>(
      "suggestion.enableRename"
    );

    if (typeof enableRenameSuggestion === "boolean") {
      return enableRenameSuggestion;
    }

    // TODO: Legacy config migration
    return config.get<boolean>("enableRenameSuggestion", false);
  }

  getAnthropicConfig(): LlmConfig {
    const config = this.config;

    return {
      provider: "anthropic",
      baseURL: config.get("anthropic.baseURL", ""),
      apiKey: config.get("anthropic.apiKey", ""),
      model: config.get("anthropic.model", ""),
    };
  }

  getOpenAIConfig(): LlmConfig {
    const config = this.config;

    const params: LlmConfig = {
      provider: "openai",
      apiType: config.get(".openai.apiType", ""),
      baseURL: config.get("openai.baseURL", ""),
      apiKey: config.get("openai.apiKey", ""),
      model: config.get("openai.model", ""),
      organization: config.get("openai.organization", ""),
      project: config.get("openai.project", ""),
    };

    if (params.apiKey || params.project) {return params;}

    return this.getLegacyOpenAIConfig();
  }

  getLegacyOpenAIConfig(): LlmConfig {
    const config = this.config;
    
    let baseURL = config.get<string>("openaiCompatibleConfig.apiBase", "");

    // https://api.openai.com => https://api.openai.com/v1/
    if (baseURL && !baseURL.includes('/v1')) {
      if (baseURL.includes('/v1')) {
        baseURL = addEndingSlash(baseURL);
      } else {
        baseURL = removeEndingSlash(baseURL) + '/v1/';
      }
    }

    return {
      provider: "openai",
      apiType: config.get<string>("openaiCompatibleConfig.apiType", ""),
      baseURL: baseURL,
      apiKey: config.get<string>("openaiCompatibleConfig.apiKey", ""),
      model: config.get<string>("openaiCompatibleConfig.model", ""),
    };
  }

  getQianFanConfig(): LlmConfig {
    const config = this.config;

    return {
      provider: "qianfan",
      apiKey: config.get("qianfan.apiKey", ""),
      secretKey: config.get("qianfan.secretKey", ""),
      model: config.get("qianfan.model", ""),
    };
  }

  getTongYiConfig(): LlmConfig {
    const config = this.config;

    return {
      provider: "tongyi",
      apiKey: config.get("tongyi.apiKey", ""),
      model: config.get("tongyi.model", ""),
      enableSearch: config.get("tongyi.enableSearch", false),
    };
  }

  getCodeCompletionConfig(): LlmConfig {
    const config = this.getOpenAIConfig();
    const model = this.config.get<string>("completion.model");

    // Override model if it's set
    if (model) {
      config.model = model;
    }

    return config;
  }

  getChatCompletionConfig(): LlmConfig {
    return this.getCodeCompletionConfig();
  }

  // TODO: Need to register to context.subscriptions
  dispose() {
    this.disposables.forEach((disposeble) => disposeble.dispose());
    this.disposables = [];
  }
}

const removeEndingSlash = (str: string): string =>
  str.replace(/\/$/, '');

const addEndingSlash = (str: string): string =>  str.endsWith('/') ? str : `${str}/`;