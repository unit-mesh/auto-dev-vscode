// Namespaces
export const AUTODEV_CONFIG_PREFIX = 'autodev';

// Genernal Commands
export const CMD_OPEN_SETTINGS = 'autodev.openSettings';
export const CMD_SHOW_TUTORIAL = 'autodev.showTutorial';
export const CMD_FEEDBACK = 'autodev.feedback';

// AutoDev Commands
export const CMD_SHOW_SYSTEM_ACTION = 'autodev.showSystemAction'; // statusbar icon click
export const CMD_SHOW_CODELENS_DETAIL_QUICKPICK = 'autodev.showCodelensDetailQuickPick'; // codelens icon click

// Errors Fix Commands
export const CMD_QUICK_FIX = 'autodev.quickFix';

// ContextMenu Commands
export const CMD_FIX_THIS = 'autodev.fixThis';
export const CMD_EXPLAIN_CODE = 'autodev.explainCode';
export const CMD_OPTIMIZE_CODE = 'autodev.optimizeCode';
export const CMD_GEN_DOCSTRING = 'autodev.autoComment';
export const CMD_CREATE_UNIT_TEST = 'autodev.autoTest';

// Codelens Commands
export const CMD_CODELENS_QUICK_CHAT = 'autodev.codelens.quickChat';
export const CMD_CODELENS_EXPLAIN_CODE = 'autodev.codelens.explainCode';
export const CMD_CODELENS_OPTIMIZE_CODE = 'autodev.codelens.optimizeCode';
export const CMD_CODELENS_GEN_DOCSTRING = 'autodev.codelens.autoComment';
export const CMD_CODELENS_CREATE_UNIT_TEST = 'autodev.codelens.autoTest';
export const CMD_CODELENS_SHOW_CUSTOM_ACTION = 'autodev.codelens.customAction';

// Chat Commands
export const CMD_SHOW_CHAT_PANEL = 'autodev.showChatPanel';
export const CMD_QUICK_CHAT = 'autodev.quickChat';
export const CMD_NEW_CHAT_SESSION = 'autodev.newChatSession';
export const CMD_SHOW_CHAT_HISTORY = 'autodev.showChatHistory';

// Codebase Commands
export const CMD_CODEBASE_INDEXING = 'autodev.codebase.createIndexes';
export const CMD_CODEBASE_RETRIEVAL = 'autodev.codebase.retrievalCode';

// Terminal Commands
export const CMD_TERMINAL_SEND_TO = 'autodev.sendToTerminal';
export const CMD_TERMINAL_DEBUG = 'autodev.debugTerminal';
export const CMD_TERMINAL_EXPLAIN_SELECTION_CONTEXT_MENU = 'autodev.terminal.explainTerminalSelectionContextMenu';

// Other Commands
export const CMD_GIT_MESSAGE_COMMIT_GENERATE = 'autodev.git.generateCommitMessage';
export const CMD_API_GENETATE_DATA = 'autodev.git.genApiData';

// Chat Slash Commands
export const CMD_CODEASPACE_ANALYSIS = 'autodev.codespaceCodeAnalysis';
export const CMD_CODEASPACE_KEYWORDS_ANALYSIS = 'autodev.codespaceKeywordsAnalysis';

// Webview Views
export const CHAT_VIEW_ID = 'autodev.views.chat';

// Embeddings
export const EMBEDDING_BATCH_SIZE = 512;
export const EMBEDDING_STRIP_NEW_LINES = true;
