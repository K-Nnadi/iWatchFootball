import {
    Paper,
    Title,
    Stack,
    TextInput,
    Group,
    Select,
    Divider,
    Radio,
} from '@mantine/core';
import { ModernButton } from '../../components/modern';
import { UserDetails, CheckoutErrors } from './types';

interface DetailsStepProps {
    userDetails: UserDetails;
    errors: CheckoutErrors;
    onUserDetailsChange: (field: string, value: string) => void;
    onNext: () => void;
}

export function DetailsStep({
    userDetails,
    errors,
    onUserDetailsChange,
    onNext,
}: DetailsStepProps) {
    return (
        <Paper shadow="xs" radius="md" p="md" withBorder>
            <Title order={3} size="h5" mb="md">
                Your Details
            </Title>

            <Stack gap="md">
                <TextInput
                    label="Email Address"
                    placeholder="Email address"
                    required
                    value={userDetails.email}
                    error={errors.email}
                    onChange={(e) => onUserDetailsChange('email', e.currentTarget.value)}
                />

                <TextInput
                    label="Confirm Email Address"
                    placeholder="Confirm email address"
                    required
                    value={userDetails.confirmEmail}
                    error={errors.confirmEmail}
                    onChange={(e) => onUserDetailsChange('confirmEmail', e.currentTarget.value)}
                />

                <Group grow>
                    <Select
                        label="Country Code"
                        value={userDetails.phoneCountryCode}
                        onChange={(value) => onUserDetailsChange('phoneCountryCode', value || '+44')}
                        data={['+44', '+1', '+33', '+49', '+39']}
                        style={{ flex: '0 0 120px' }}
                    />
                    <TextInput
                        label="Mobile Phone"
                        placeholder="7400 123456"
                        required
                        value={userDetails.phone}
                        error={errors.phone}
                        onChange={(e) => onUserDetailsChange('phone', e.currentTarget.value)}
                    />
                </Group>

                <Divider my="sm" label="Billing Address" labelPosition="center" />

                <Radio.Group
                    value={userDetails.addressType}
                    onChange={(value) => onUserDetailsChange('addressType', value as 'Personal' | 'Business')}
                >
                    <Group>
                        <Radio value="Personal" label="Personal" />
                        <Radio value="Business" label="Business" />
                    </Group>
                </Radio.Group>

                <Group grow>
                    <TextInput
                        label="First Name"
                        placeholder="First name"
                        required
                        value={userDetails.firstName}
                        error={errors.firstName}
                        onChange={(e) => onUserDetailsChange('firstName', e.currentTarget.value)}
                    />
                    <TextInput
                        label="Last Name"
                        placeholder="Last name"
                        required
                        value={userDetails.lastName}
                        error={errors.lastName}
                        onChange={(e) => onUserDetailsChange('lastName', e.currentTarget.value)}
                    />
                </Group>

                <TextInput
                    label="Address"
                    placeholder="Address"
                    required
                    value={userDetails.address}
                    error={errors.address}
                    onChange={(e) => onUserDetailsChange('address', e.currentTarget.value)}
                />

                <TextInput
                    label="Address Line 2"
                    placeholder="Address line 2"
                    value={userDetails.addressLine2}
                    onChange={(e) => onUserDetailsChange('addressLine2', e.currentTarget.value)}
                />

                <Group grow>
                    <TextInput
                        label="Postcode"
                        placeholder="Postcode"
                        required
                        value={userDetails.postcode}
                        error={errors.postcode}
                        onChange={(e) => onUserDetailsChange('postcode', e.currentTarget.value)}
                    />
                    <TextInput
                        label="Town / City"
                        placeholder="Town / City"
                        required
                        value={userDetails.townCity}
                        error={errors.townCity}
                        onChange={(e) => onUserDetailsChange('townCity', e.currentTarget.value)}
                    />
                </Group>

                <Select
                    label="Country"
                    placeholder="Select country"
                    required
                    value={userDetails.country}
                    onChange={(value) => onUserDetailsChange('country', value || 'United Kingdom')}
                    data={['United Kingdom', 'United States', 'France', 'Germany', 'Italy', 'Spain']}
                />

                <TextInput
                    label="Region / State"
                    placeholder="Region / State"
                    value={userDetails.regionState}
                    onChange={(e) => onUserDetailsChange('regionState', e.currentTarget.value)}
                />
            </Stack>

            <Group mt="xl">
                <ModernButton variant="primary" onClick={onNext} fullWidth>
                    Continue
                </ModernButton>
            </Group>
        </Paper>
    );
}

