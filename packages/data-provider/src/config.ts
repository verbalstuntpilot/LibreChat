/* eslint-disable max-len */
import { z } from 'zod';
import { EModelEndpoint, eModelEndpointSchema } from './schemas';
import { FileSources } from './types/files';

export const fileSourceSchema = z.nativeEnum(FileSources);

export const endpointSchema = z.object({
  name: z.string().refine((value) => !eModelEndpointSchema.safeParse(value).success, {
    message: `Value cannot be one of the default endpoint (EModelEndpoint) values: ${Object.values(
      EModelEndpoint,
    ).join(', ')}`,
  }),
  apiKey: z.string(),
  baseURL: z.string(),
  models: z.object({
    default: z.array(z.string()).min(1),
    fetch: z.boolean().optional(),
  }),
  titleConvo: z.boolean().optional(),
  titleMethod: z.union([z.literal('completion'), z.literal('functions')]).optional(),
  titleModel: z.string().optional(),
  summarize: z.boolean().optional(),
  summaryModel: z.string().optional(),
  forcePrompt: z.boolean().optional(),
  modelDisplayLabel: z.string().optional(),
  headers: z.record(z.any()).optional(),
});

export const configSchema = z.object({
  version: z.string(),
  cache: z.boolean(),
  fileStrategy: fileSourceSchema.optional(),
  endpoints: z
    .object({
      custom: z.array(endpointSchema.partial()),
    })
    .strict(),
});

export enum KnownEndpoints {
  mistral = 'mistral',
  openrouter = 'openrouter',
}

export const defaultEndpoints: EModelEndpoint[] = [
  EModelEndpoint.openAI,
  EModelEndpoint.assistant,
  EModelEndpoint.azureOpenAI,
  EModelEndpoint.bingAI,
  EModelEndpoint.chatGPTBrowser,
  EModelEndpoint.gptPlugins,
  EModelEndpoint.google,
  EModelEndpoint.anthropic,
  EModelEndpoint.custom,
];

export const alternateName = {
  [EModelEndpoint.openAI]: 'OpenAI',
  [EModelEndpoint.assistant]: 'Assistants',
  [EModelEndpoint.azureOpenAI]: 'Azure OpenAI',
  [EModelEndpoint.bingAI]: 'Bing',
  [EModelEndpoint.chatGPTBrowser]: 'ChatGPT',
  [EModelEndpoint.gptPlugins]: 'Plugins',
  [EModelEndpoint.google]: 'Google',
  [EModelEndpoint.anthropic]: 'Anthropic',
  [EModelEndpoint.custom]: 'Custom',
};

export const defaultModels = {
  [EModelEndpoint.google]: [
    'gemini-pro',
    'gemini-pro-vision',
    'chat-bison',
    'chat-bison-32k',
    'codechat-bison',
    'codechat-bison-32k',
    'text-bison',
    'text-bison-32k',
    'text-unicorn',
    'code-gecko',
    'code-bison',
    'code-bison-32k',
  ],
  [EModelEndpoint.anthropic]: [
    'claude-2.1',
    'claude-2',
    'claude-1.2',
    'claude-1',
    'claude-1-100k',
    'claude-instant-1',
    'claude-instant-1-100k',
  ],
  [EModelEndpoint.openAI]: [
    'gpt-3.5-turbo-16k-0613',
    'gpt-3.5-turbo-16k',
    'gpt-4-1106-preview',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-1106',
    'gpt-4-vision-preview',
    'gpt-4',
    'gpt-3.5-turbo-instruct-0914',
    'gpt-3.5-turbo-0613',
    'gpt-3.5-turbo-0301',
    'gpt-3.5-turbo-instruct',
    'gpt-4-0613',
    'text-davinci-003',
    'gpt-4-0314',
  ],
};

export const EndpointURLs: { [key in EModelEndpoint]: string } = {
  [EModelEndpoint.openAI]: `/api/ask/${EModelEndpoint.openAI}`,
  [EModelEndpoint.bingAI]: `/api/ask/${EModelEndpoint.bingAI}`,
  [EModelEndpoint.google]: `/api/ask/${EModelEndpoint.google}`,
  [EModelEndpoint.custom]: `/api/ask/${EModelEndpoint.custom}`,
  [EModelEndpoint.anthropic]: `/api/ask/${EModelEndpoint.anthropic}`,
  [EModelEndpoint.gptPlugins]: `/api/ask/${EModelEndpoint.gptPlugins}`,
  [EModelEndpoint.azureOpenAI]: `/api/ask/${EModelEndpoint.azureOpenAI}`,
  [EModelEndpoint.chatGPTBrowser]: `/api/ask/${EModelEndpoint.chatGPTBrowser}`,
  [EModelEndpoint.assistant]: '/api/assistants/chat',
};

export const modularEndpoints = new Set<EModelEndpoint | string>([
  EModelEndpoint.gptPlugins,
  EModelEndpoint.anthropic,
  EModelEndpoint.google,
  EModelEndpoint.openAI,
  EModelEndpoint.azureOpenAI,
  EModelEndpoint.custom,
]);

export const supportsFiles = {
  [EModelEndpoint.openAI]: true,
  [EModelEndpoint.google]: true,
  [EModelEndpoint.assistant]: true,
  [EModelEndpoint.azureOpenAI]: true,
  [EModelEndpoint.custom]: true,
};

export const supportsBalanceCheck = {
  [EModelEndpoint.openAI]: true,
  [EModelEndpoint.azureOpenAI]: true,
  [EModelEndpoint.gptPlugins]: true,
  [EModelEndpoint.custom]: true,
};

export const visionModels = ['gpt-4-vision', 'llava-13b', 'gemini-pro-vision'];

export const fullMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
  'text/css',
  'image/jpeg',
  'text/javascript',
  'image/gif',
  'image/png',
  'application/x-tar',
  'application/typescript',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/xml',
  'application/zip',
];

export const codeInterpreterMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
  'text/css',
  'image/jpeg',
  'text/javascript',
  'image/gif',
  'image/png',
  'application/x-tar',
  'application/typescript',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/xml',
  'application/zip',
];

export const retrievalMimeTypesList = [
  'text/x-c',
  'text/x-c++',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html',
  'text/x-java',
  'application/json',
  'text/markdown',
  'application/pdf',
  'text/x-php',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/x-python',
  'text/x-script.python',
  'text/x-ruby',
  'text/x-tex',
  'text/plain',
];

export const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i;

export const textMimeTypes =
  /^(text\/(x-c|x-c\+\+|x-java|html|markdown|x-php|x-python|x-script\.python|x-ruby|x-tex|plain|css|javascript))$/;

export const applicationMimeTypes =
  /^(application\/(csv|json|pdf|x-tar|typescript|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet)|xml|zip))$/;

export const imageMimeTypes = /^image\/(jpeg|gif|png|webp)$/;

export const supportedMimeTypes = [textMimeTypes, applicationMimeTypes, imageMimeTypes];

export const codeInterpreterMimeTypes = [textMimeTypes, applicationMimeTypes, imageMimeTypes];

export const retrievalMimeTypes = [
  /^(text\/(x-c|x-c\+\+|html|x-java|markdown|x-php|x-python|x-script\.python|x-ruby|x-tex|plain))$/,
  /^(application\/(json|pdf|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation)))$/,
];

export const megabyte = 1024 * 1024;

export const fileConfig = {
  [EModelEndpoint.assistant]: {
    fileLimit: 10,
    fileMaxSizeMB: 512,
    totalMaxSizeMB: 512,
    fileSizeLimit: 512 * megabyte,
    totalSizeLimit: 512 * megabyte,
    supportedMimeTypes,
  },
  default: {
    fileLimit: 10,
    fileMaxSizeMB: 20,
    totalMaxSizeMB: 25,
    fileSizeLimit: 20 * megabyte,
    totalSizeLimit: 25 * megabyte,
    supportedMimeTypes: [textMimeTypes, imageMimeTypes],
  },
  serverFileSizeLimit: 512 * megabyte,
  avatarSizeLimit: 2 * megabyte,
  checkType: function (fileType: string, supportedTypes: RegExp[] = supportedMimeTypes) {
    return supportedTypes.some((regex) => regex.test(fileType));
  },
};

export const imageGenTools = new Set(['dalle', 'dall-e', 'stable-diffusion']);

/**
 * Enum for cache keys.
 */
export enum CacheKeys {
  /**
   * Key for the config store namespace.
   */
  CONFIG_STORE = 'configStore',
  /**
   * Key for the plugins cache.
   */
  PLUGINS = 'plugins',
  /**
  /**
   * Key for the tools cache.
   */
  TOOLS = 'tools',
  /**
   * Key for the model config cache.
   */
  MODELS_CONFIG = 'modelsConfig',
  /**
   * Key for the default endpoint config cache.
   */
  ENDPOINT_CONFIG = 'endpointsConfig',
  /**
   * Key for the custom config cache.
   */
  CUSTOM_CONFIG = 'customConfig',
  /**
   * Key for the override config cache.
   */
  OVERRIDE_CONFIG = 'overrideConfig',
}

/**
 * Enum for authentication keys.
 */
export enum AuthKeys {
  /**
   * Key for the Service Account to use Vertex AI.
   */
  GOOGLE_SERVICE_KEY = 'GOOGLE_SERVICE_KEY',
  /**
   * API key to use Google Generative AI.
   */
  GOOGLE_API_KEY = 'GOOGLE_API_KEY',
}

/**
 * Enum for Image Detail Cost.
 *
 * **Low Res Fixed Cost:** `85`
 *
 * **High Res Calculation:**
 *
 * Number of `512px` Tiles * `170` + `85` (Additional Cost)
 */
export enum ImageDetailCost {
  /**
   * Low resolution is a fixed value.
   */
  LOW = 85,
  /**
   * High resolution Cost Per Tile
   */
  HIGH = 170,
  /**
   * Additional Cost added to High Resolution Total Cost
   */
  ADDITIONAL = 85,
}

/**
 * Tab values for Settings Dialog
 */
export enum SettingsTabValues {
  /**
   * Tab for General Settings
   */
  GENERAL = 'general',
  /**
   * Tab for Beta Features
   */
  BETA = 'beta',
  /**
   * Tab for Data Controls
   */
  DATA = 'data',
  /**
   * Tab for Account Settings
   */
  ACCOUNT = 'account',
}

/**
 * Enum for app-wide constants
 */
export enum Constants {
  /**
   * Key for the app's version.
   */
  VERSION = 'v0.6.5',
  /**
   * Standard value for the first message's `parentMessageId` value, to indicate no parent exists.
   */
  NO_PARENT = '00000000-0000-0000-0000-000000000000',
}

export const defaultOrderQuery: {
  order: 'asc';
} = {
  order: 'asc',
};
