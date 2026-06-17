import { Container, Stack } from '@mantine/core';
import { ModernBody, ModernCard, ModernH1 } from '../../components/modern';
import { useTranslation } from '../../i18n';

type LegalDoc = 'privacy' | 'terms' | 'cookies';

export function LegalDocumentPage({ doc }: { doc: LegalDoc }) {
    const { t } = useTranslation();

    return (
        <Container size="md" py="xl">
            <ModernCard padding="lg">
                <Stack gap="md">
                    <ModernH1>{t(`legal.${doc}.title`)}</ModernH1>
                    <ModernBody style={{ color: 'var(--modern-text-secondary)', lineHeight: 1.65 }}>
                        {t(`legal.${doc}.body`)}
                    </ModernBody>
                </Stack>
            </ModernCard>
        </Container>
    );
}
