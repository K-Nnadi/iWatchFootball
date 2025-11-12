import { Paper, Title, Stack, Checkbox, Group, Button, Box, Text } from '@mantine/core';
import { ModernButton } from '../../components/modern';
import { AdditionalInfo, CheckoutErrors } from './types';

interface AdditionalInfoStepProps {
    additionalInfo: AdditionalInfo;
    errors: CheckoutErrors;
    onAdditionalInfoChange: (field: keyof AdditionalInfo, value: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

export function AdditionalInfoStep({
    additionalInfo,
    errors,
    onAdditionalInfoChange,
    onNext,
    onBack,
}: AdditionalInfoStepProps) {
    return (
        <Paper shadow="xs" radius="md" p="md" withBorder>
            <Title order={3} size="h5" mb="md">
                Additional Information
            </Title>

            <Stack spacing="md">
                <Box>
                    <Checkbox
                        label="I have read and agree to the Terms and Conditions & Privacy Policy"
                        checked={additionalInfo.agreeToTerms}
                        onChange={(checked) => onAdditionalInfoChange('agreeToTerms', checked)}
                    />
                    {errors.agreeToTerms && (
                        <Text size="xs" color="red" mt={4}>
                            {errors.agreeToTerms}
                        </Text>
                    )}
                </Box>

                <Checkbox
                    label="I agree to receive relevant emails with event updates and offers"
                    checked={additionalInfo.agreeToMarketing}
                    onChange={(checked) => onAdditionalInfoChange('agreeToMarketing', checked)}
                />
            </Stack>

            <Group mt="xl">
                <Button variant="default" onClick={onBack} style={{ flex: 1 }}>
                    Back
                </Button>
                <ModernButton variant="primary" onClick={onNext} style={{ flex: 1 }}>
                    Continue
                </ModernButton>
            </Group>
        </Paper>
    );
}

