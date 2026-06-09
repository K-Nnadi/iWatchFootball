export enum IntegrationKind {
    PAYMENT = 'PAYMENT',
    LLM = 'LLM',
    HTTP_API = 'HTTP_API',
    DATA_SYNC = 'DATA_SYNC',
}

/** Well-known provider keys — config shape varies by provider. */
export enum IntegrationProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    AZURE_OPENAI = 'azure_openai',
    API_SPORTS = 'api_sports',
    STATSBOMB = 'statsbomb',
    CUSTOM = 'custom',
}

/** How credentials in `config` are resolved at runtime. */
export enum IntegrationAuthType {
    /** config.apiKey or config.secretKey stored directly */
    INLINE = 'INLINE',
    /** config.secretRef names a process.env key */
    ENV_VAR = 'ENV_VAR',
    BEARER_HEADER = 'BEARER_HEADER',
    API_KEY_HEADER = 'API_KEY_HEADER',
}

export enum AiUsageOperation {
    FIXTURE_INSIGHT_STREAM = 'FIXTURE_INSIGHT_STREAM',
}
