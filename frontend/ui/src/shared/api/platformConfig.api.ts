import axios from 'axios';

export type ConfigValueType = 'number' | 'string' | 'boolean' | 'array' | 'json';

export interface PlatformConfigEntry {
    key: string;
    valueType: ConfigValueType;
    value: unknown;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePlatformConfigPayload {
    valueType: ConfigValueType;
    numberValue?: number;
    stringValue?: string;
    booleanValue?: boolean;
    arrayValue?: unknown[];
    jsonValue?: Record<string, unknown>;
    description?: string;
}

export async function listPlatformConfig(): Promise<PlatformConfigEntry[]> {
    const { data } = await axios.get<PlatformConfigEntry[]>('/platform-config');
    return data;
}

export async function updatePlatformConfig(
    key: string,
    payload: UpdatePlatformConfigPayload,
): Promise<void> {
    await axios.patch(`/platform-config/${encodeURIComponent(key)}`, payload);
}
