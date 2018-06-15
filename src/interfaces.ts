export interface LxrConfig {
  host: string;
  workspace: string;
  apitoken: string;
  localPort?: string;
  proxyURL?: string;
  ssl?: {
    cert: string;
    key: string;
  };
}

export interface UserInitInput {
  name: string;
  id: string;
  author: string;
  title: string;
  description: string;
  licence: string;
  host: string;
  apitoken: string;
  proxyURL?: string;
}