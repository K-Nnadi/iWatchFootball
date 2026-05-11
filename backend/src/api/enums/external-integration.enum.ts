export enum ExternalIntegrationKind {
    LLM = 'LLM',
    HTTP_API = 'HTTP_API',
}

export enum ExternalIntegrationProvider {
    ANTHROPIC = 'anthropic',
    OPENAI = 'openai',
    AZURE_OPENAI = 'azure_openai',
    CUSTOM = 'custom',
}

export enum ExternalIntegrationAuthType {
    ENV_VAR = 'ENV_VAR',
    BEARER_HEADER = 'BEARER_HEADER',
    API_KEY_HEADER = 'API_KEY_HEADER',
}

export enum AiUsageOperation {
    FIXTURE_INSIGHT_STREAM = 'FIXTURE_INSIGHT_STREAM',
}
