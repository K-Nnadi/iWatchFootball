// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DiscountCodeControllerCreateBodyType = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED: 'FIXED',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdatePlatformConfigDtoValueType = {
    number: 'number',
    string: 'string',
    boolean: 'boolean',
    array: 'array',
    json: 'json',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ConfirmMarketplacePurchaseDtoPaymentMethod = {
    CreditCard: 'CreditCard',
    PayPal: 'PayPal',
    PlatformCredit: 'PlatformCredit',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const WebhookConfirmCheckoutDtoPaymentMethod = {
    CreditCard: 'CreditCard',
    PayPal: 'PayPal',
    PlatformCredit: 'PlatformCredit',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ConfirmCheckoutDtoPaymentMethod = {
    CreditCard: 'CreditCard',
    PayPal: 'PayPal',
    PlatformCredit: 'PlatformCredit',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const IntegrationProvider = {
    stripe: 'stripe',
    paypal: 'paypal',
    openai: 'openai',
    anthropic: 'anthropic',
    azure_openai: 'azure_openai',
    api_sports: 'api_sports',
    statsbomb: 'statsbomb',
    custom: 'custom',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const IntegrationKind = {
    PAYMENT: 'PAYMENT',
    LLM: 'LLM',
    HTTP_API: 'HTTP_API',
    DATA_SYNC: 'DATA_SYNC',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateIntegrationDTOProvider = {
    stripe: 'stripe',
    paypal: 'paypal',
    openai: 'openai',
    anthropic: 'anthropic',
    azure_openai: 'azure_openai',
    api_sports: 'api_sports',
    statsbomb: 'statsbomb',
    custom: 'custom',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateIntegrationDTOKind = {
    PAYMENT: 'PAYMENT',
    LLM: 'LLM',
    HTTP_API: 'HTTP_API',
    DATA_SYNC: 'DATA_SYNC',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateUserDTOType = {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    USER: 'USER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UserType = {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    USER: 'USER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UserTrackerVisibility = {
    PRIVATE: 'PRIVATE',
    FRIENDS: 'FRIENDS',
    PUBLIC: 'PUBLIC',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TeamType = {
    Club: 'Club',
    Country: 'Country',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TeamGender = {
    Male: 'Male',
    Female: 'Female',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateTeamDTOType = {
    Club: 'Club',
    Country: 'Country',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PositionType = {
    Goalkeeper: 'Goalkeeper',
    Defender: 'Defender',
    Midfielder: 'Midfielder',
    Forward: 'Forward',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreatePositionDTOType = {
    Goalkeeper: 'Goalkeeper',
    Defender: 'Defender',
    Midfielder: 'Midfielder',
    Forward: 'Forward',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreatePaymentProcessorDTOType = {
    CARD: 'CARD',
    WALLET: 'WALLET',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CRYPTO: 'CRYPTO',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PaymentProcessorType = {
    CARD: 'CARD',
    WALLET: 'WALLET',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CRYPTO: 'CRYPTO',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UserNotificationType = {
    FRIEND_REQUEST_RECEIVED: 'FRIEND_REQUEST_RECEIVED',
    FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UpdateTrackerPrivacyDtoTrackerVisibility = {
    PRIVATE: 'PRIVATE',
    FRIENDS: 'FRIENDS',
    PUBLIC: 'PUBLIC',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GenericTokenType = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateGenericTokenDTOType = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FixtureRefereeRole = {
    Main: 'Main',
    Assistant: 'Assistant',
    Var: 'Var',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateFixtureRefereeDTORole = {
    Main: 'Main',
    Assistant: 'Assistant',
    Var: 'Var',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FixtureStatus = {
    Scheduled: 'Scheduled',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    Postponed: 'Postponed',
    Suspended: 'Suspended',
    Live: 'Live',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FixtureStage = {
    Final: 'Final',
    Semi_Final: 'Semi Final',
    Quarter_Final: 'Quarter Final',
    Last_16: 'Last 16',
    Last_32: 'Last 32',
    Group_Stage: 'Group Stage',
    Third_Place: 'Third Place',
    Play_Off: 'Play Off',
    Round_Robin: 'Round Robin',
    League: 'League',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateFixtureDTOStatus = {
    Scheduled: 'Scheduled',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    Postponed: 'Postponed',
    Suspended: 'Suspended',
    Live: 'Live',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateFixtureDTOStage = {
    Final: 'Final',
    Semi_Final: 'Semi Final',
    Quarter_Final: 'Quarter Final',
    Last_16: 'Last 16',
    Last_32: 'Last 32',
    Group_Stage: 'Group Stage',
    Third_Place: 'Third Place',
    Play_Off: 'Play Off',
    Round_Robin: 'Round Robin',
    League: 'League',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CompetitionType = {
    League: 'League',
    Cup: 'Cup',
    Custom: 'Custom',
    Friendly: 'Friendly',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CreateCompetitionDTOType = {
    League: 'League',
    Cup: 'Cup',
    Custom: 'Custom',
    Friendly: 'Friendly',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceSmsNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferencePushNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceNewsletterEmails = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceMatchReminders = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceMarketingEmails = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceLanguage = {
    EN: 'EN',
    ES: 'ES',
    FR: 'FR',
    DE: 'DE',
    IT: 'IT',
    PT: 'PT',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceInAppNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceEmailNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOSmsNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOPushNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTONewsletterEmails = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOMatchReminders = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOMarketingEmails = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOLanguage = {
    EN: 'EN',
    ES: 'ES',
    FR: 'FR',
    DE: 'DE',
    IT: 'IT',
    PT: 'PT',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOInAppNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CommsPreferenceDTOEmailNotifications = {
    IMMEDIATE: 'IMMEDIATE',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    NEVER: 'NEVER',
};
//# sourceMappingURL=iWatchFootballAPI.schemas.js.map