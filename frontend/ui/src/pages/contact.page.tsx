import React, { useState } from 'react';
import {
  Container,
  Stack,
  TextInput,
  Textarea,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ModernButton, ModernH1, ModernBody, ModernCard } from '../components/modern';
import '../styles/modern.css';

interface ContactFormValues {
  summary: string;
  message: string;
  name: string;
  company: string;
  email: string;
}

export function ContactPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    initialValues: {
      summary: '',
      message: '',
      name: '',
      company: '',
      email: '',
    },
    validate: {
      summary: (value) => (value.trim().length < 3 ? 'Summary must be at least 3 characters' : null),
      message: (value) => (value.trim().length < 10 ? 'Message must be at least 10 characters' : null),
      name: (value) => (value.trim().length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: ContactFormValues) => {
    setLoading(true);
    
    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(values.summary);
      const body = encodeURIComponent(
        `Name: ${values.name}\n` +
        `Company: ${values.company || 'N/A'}\n` +
        `Email: ${values.email}\n\n` +
        `Message:\n${values.message}`
      );
      const mailtoLink = `mailto:kenneth_nnadi@aol.co.uk?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success notification
      notifications.show({
        title: 'Contact Form Submitted',
        message: 'Your email client should open. If not, please email kenneth_nnadi@aol.co.uk directly.',
        color: 'green',
      });
      
      // Reset form after a short delay
      setTimeout(() => {
        form.reset();
        setLoading(false);
      }, 1000);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit form. Please email kenneth_nnadi@aol.co.uk directly.',
        color: 'red',
      });
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--modern-bg-primary)',
        color: 'var(--modern-text-primary)',
        padding: 'var(--modern-space-lg) 0',
      }}
    >
      <Container size="md">
        <Stack gap="xl">
          <Box style={{ textAlign: 'center', marginBottom: 'var(--modern-space-md)' }}>
            <ModernH1 style={{ marginBottom: 'var(--modern-space-sm)' }}>
              Want to get in touch?
            </ModernH1>
            <ModernBody style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.8 }}>
              Want to learn more about I Watch Football or simply want to get in touch? Just drop us a line and someone will get in touch with you!
            </ModernBody>
          </Box>

          <ModernCard>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Summary"
                  placeholder="Brief summary of your inquiry"
                  required
                  {...form.getInputProps('summary')}
                  styles={{
                    label: {
                      color: 'var(--modern-text-primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    input: {
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderColor: 'var(--modern-border-color)',
                      color: 'var(--modern-text-primary)',
                      '&:focus': {
                        borderColor: 'var(--modern-lime)',
                      },
                    },
                  }}
                />

                <Textarea
                  label="Message"
                  placeholder="Your message..."
                  required
                  minRows={6}
                  {...form.getInputProps('message')}
                  styles={{
                    label: {
                      color: 'var(--modern-text-primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    input: {
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderColor: 'var(--modern-border-color)',
                      color: 'var(--modern-text-primary)',
                      '&:focus': {
                        borderColor: 'var(--modern-lime)',
                      },
                    },
                  }}
                />

                <TextInput
                  label="Your Name"
                  placeholder="John Doe"
                  required
                  {...form.getInputProps('name')}
                  styles={{
                    label: {
                      color: 'var(--modern-text-primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    input: {
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderColor: 'var(--modern-border-color)',
                      color: 'var(--modern-text-primary)',
                      '&:focus': {
                        borderColor: 'var(--modern-lime)',
                      },
                    },
                  }}
                />

                <TextInput
                  label="Your Company"
                  placeholder="Company name (optional)"
                  {...form.getInputProps('company')}
                  styles={{
                    label: {
                      color: 'var(--modern-text-primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    input: {
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderColor: 'var(--modern-border-color)',
                      color: 'var(--modern-text-primary)',
                      '&:focus': {
                        borderColor: 'var(--modern-lime)',
                      },
                    },
                  }}
                />

                <TextInput
                  label="Your Email"
                  placeholder="your.email@example.com"
                  type="email"
                  required
                  {...form.getInputProps('email')}
                  styles={{
                    label: {
                      color: 'var(--modern-text-primary)',
                      fontWeight: 600,
                      marginBottom: 8,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    input: {
                      backgroundColor: 'var(--modern-bg-secondary)',
                      borderColor: 'var(--modern-border-color)',
                      color: 'var(--modern-text-primary)',
                      '&:focus': {
                        borderColor: 'var(--modern-lime)',
                      },
                    },
                  }}
                />

                <Box style={{ marginTop: 'var(--modern-space-sm)' }}>
                  <ModernButton
                    type="submit"
                    size="lg"
                    variant="primary"
                    loading={loading}
                    fullWidth
                  >
                    Submit
                  </ModernButton>
                </Box>
              </Stack>
            </form>
          </ModernCard>

          <Box style={{ textAlign: 'center', marginTop: 'var(--modern-space-md)' }}>
            <ModernBody style={{ opacity: 0.6, fontSize: '0.875rem' }}>
              Or email us directly at:{' '}
              <a
                href="mailto:kenneth_nnadi@aol.co.uk"
                style={{
                  color: 'var(--modern-lime)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                kenneth_nnadi@aol.co.uk
              </a>
            </ModernBody>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

