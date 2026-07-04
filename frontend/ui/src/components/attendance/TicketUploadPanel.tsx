import { useState, useRef } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconUpload, IconFileCheck, IconTrash } from '@tabler/icons-react';
import { uploadAttendanceDocument } from '../../shared/api/attendance.api';
import { notify } from '../../shared/notify';

interface TicketUploadPanelProps {
    attendanceId: number;
    hasDocument: boolean;
    onUploaded?: () => void;
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.heic,.heif';

export function TicketUploadPanel({ attendanceId, hasDocument, onUploaded }: TicketUploadPanelProps) {
    const [uploading, setUploading] = useState(false);
    const [currentlyHasDoc, setCurrentlyHasDoc] = useState(hasDocument);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await uploadAttendanceDocument(attendanceId, file);
            setCurrentlyHasDoc(true);
            notify.success('Ticket uploaded', 'Your ticket has been saved privately.');
            onUploaded?.();
        } catch {
            notify.error('Upload failed', 'Please check the file type (PDF, JPG, PNG, HEIC) and size (max 10 MB).');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <Box
            p="sm"
            style={{
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 'var(--mantine-radius-sm)',
                background: 'var(--mantine-color-dark-7)',
            }}
        >
            <Stack gap="xs">
                <Group gap="xs">
                    {currentlyHasDoc ? (
                        <IconFileCheck size={16} color="var(--mantine-color-green-5)" />
                    ) : (
                        <IconUpload size={16} color="var(--mantine-color-dimmed)" />
                    )}
                    <Text size="sm" fw={500}>
                        {currentlyHasDoc ? 'Ticket document uploaded' : 'Upload ticket document'}
                    </Text>
                    <Text size="xs" c="dimmed" ml={4}>(Private — only you can see this)</Text>
                </Group>

                <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED}
                    style={{ display: 'none' }}
                    onChange={(e) => void handleFileChange(e)}
                />

                <Button
                    size="xs"
                    variant="light"
                    leftSection={currentlyHasDoc ? <IconTrash size={13} /> : <IconUpload size={13} />}
                    loading={uploading}
                    onClick={() => fileRef.current?.click()}
                >
                    {currentlyHasDoc ? 'Replace document' : 'Choose file'}
                </Button>

                <Text size="xs" c="dimmed">PDF, JPG, PNG or HEIC · max 10 MB</Text>
            </Stack>
        </Box>
    );
}
