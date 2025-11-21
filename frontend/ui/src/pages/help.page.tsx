import React, { useState } from 'react';
import {
  Container,
  Stack,
  Box,
  Accordion,
  Group,
  Text,
  Divider,
  Anchor,
} from '@mantine/core';
import { 
  IconHelp, 
  IconQuestionMark, 
  IconInfoCircle, 
  IconMail,
  IconBook,
  IconBug,
  IconSettings,
  IconTicket,
  IconChartBar,
  IconUser,
  IconLock,
} from '@tabler/icons-react';
import { ModernButton, ModernH1, ModernH2, ModernH3, ModernBody, ModernCard } from '../components/modern';
import { usePageTransition } from '../hooks/usePageTransition';
import '../styles/modern.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'account' | 'features' | 'troubleshooting';
}

const faqs: FAQItem[] = [
  // General FAQs
  {
    id: 'what-is-iwf',
    question: 'What is I Watch Football?',
    answer: 'I Watch Football is a comprehensive football tracking platform that allows you to follow live matches, track your personal football statistics, book tickets, and stay updated with the latest football news. It\'s your ultimate companion for everything football-related.',
    category: 'general',
  },
  {
    id: 'how-to-sign-up',
    question: 'How do I create an account?',
    answer: 'To create an account, click on the "Sign Up" or "Join" button in the navigation menu. You\'ll need to provide your email address, create a password, and complete the registration form. Once registered, you can start tracking your football journey!',
    category: 'general',
  },
  {
    id: 'is-free',
    question: 'Is I Watch Football free to use?',
    answer: 'Yes! I Watch Football offers a free tier with access to live scores, match information, and basic statistics. Some premium features may require a subscription. Check our pricing page for more details.',
    category: 'general',
  },
  {
    id: 'supported-leagues',
    question: 'Which leagues and competitions are supported?',
    answer: 'We support major football leagues and competitions worldwide, including the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, and many more. Our database is continuously updated to include new competitions.',
    category: 'general',
  },
  
  // Account FAQs
  {
    id: 'reset-password',
    question: 'How do I reset my password?',
    answer: 'If you\'ve forgotten your password, click on "Sign In" and then select "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password. Make sure to check your spam folder if you don\'t see the email.',
    category: 'account',
  },
  {
    id: 'change-email',
    question: 'Can I change my email address?',
    answer: 'Yes, you can change your email address in your account settings. Go to Settings > Account and update your email. You\'ll need to verify the new email address before the change takes effect.',
    category: 'account',
  },
  {
    id: 'delete-account',
    question: 'How do I delete my account?',
    answer: 'To delete your account, go to Settings > Account and scroll down to the "Delete Account" section. Please note that this action is permanent and cannot be undone. All your data, including statistics and preferences, will be permanently deleted.',
    category: 'account',
  },
  {
    id: 'privacy-data',
    question: 'How is my data protected?',
    answer: 'We take your privacy seriously. All data is encrypted and stored securely. We never share your personal information with third parties without your consent. For more details, please review our Privacy Policy.',
    category: 'account',
  },
  
  // Features FAQs
  {
    id: 'personal-stats',
    question: 'How do I track my personal statistics?',
    answer: 'Your personal statistics are automatically tracked when you log matches you\'ve attended, goals you\'ve witnessed, and stadiums you\'ve visited. You can view your stats on your profile page and add new entries manually if needed.',
    category: 'features',
  },
  {
    id: 'book-tickets',
    question: 'How do I book match tickets?',
    answer: 'To book tickets, navigate to the match you want to attend and click on "Book Tickets". You\'ll be able to select your seats, choose ticket types, and complete the purchase through our secure checkout system. Tickets are delivered electronically.',
    category: 'features',
  },
  {
    id: 'notifications',
    question: 'Can I get notifications for matches?',
    answer: 'Yes! You can enable notifications in your Settings. You can choose to receive notifications for match starts, goals, final scores, and other important updates. Notifications can be customized to your preferences.',
    category: 'features',
  },
  {
    id: 'favorite-teams',
    question: 'How do I follow my favorite teams?',
    answer: 'You can follow teams by visiting their team page and clicking the "Follow" button. Once followed, you\'ll see their matches, news, and updates prominently displayed in your dashboard.',
    category: 'features',
  },
  
  // Troubleshooting FAQs
  {
    id: 'page-not-loading',
    question: 'The page is not loading. What should I do?',
    answer: 'First, try refreshing the page. If that doesn\'t work, clear your browser cache and cookies, then try again. Make sure you have a stable internet connection. If the problem persists, try using a different browser or contact our support team.',
    category: 'troubleshooting',
  },
  {
    id: 'scores-not-updating',
    question: 'Why are match scores not updating?',
    answer: 'Scores should update automatically in real-time. If you notice scores aren\'t updating, try refreshing the page. If the issue continues, it may be a temporary server issue. Check our status page or contact support if the problem persists.',
    category: 'troubleshooting',
  },
  {
    id: 'login-issues',
    question: 'I can\'t log in to my account. What\'s wrong?',
    answer: 'Make sure you\'re using the correct email and password. Check if Caps Lock is on, and ensure there are no extra spaces. If you\'ve forgotten your password, use the "Forgot Password" link. If problems continue, contact our support team.',
    category: 'troubleshooting',
  },
  {
    id: 'mobile-app',
    question: 'Is there a mobile app?',
    answer: 'Currently, I Watch Football is available as a web application that works great on mobile browsers. We\'re working on native mobile apps for iOS and Android, which will be available soon. Stay tuned for updates!',
    category: 'troubleshooting',
  },
];

const categoryIcons = {
  general: IconInfoCircle,
  account: IconUser,
  features: IconChartBar,
  troubleshooting: IconBug,
};

const categoryLabels = {
  general: 'General',
  account: 'Account',
  features: 'Features',
  troubleshooting: 'Troubleshooting',
};

export function HelpPage() {
  const { navigateWithTransition } = usePageTransition();
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--modern-bg-primary)',
        color: 'var(--modern-text-primary)',
        padding: 'var(--modern-space-lg) 0',
        overflow: 'visible',
      }}
    >
      <Container size="lg" style={{ overflow: 'visible' }}>
        <Stack gap="xl">
          {/* Header Section */}
          <Box style={{ textAlign: 'center', marginBottom: 'var(--modern-space-md)' }}>
            <Group justify="center" mb="md">
              <IconHelp size={48} color="var(--modern-lime)" />
            </Group>
            <ModernH1 style={{ marginBottom: 'var(--modern-space-sm)' }}>
              Help Center
            </ModernH1>
            <ModernBody style={{ maxWidth: '700px', margin: '0 auto', opacity: 0.8 }}>
              Find answers to common questions, learn how to use features, and get the most out of I Watch Football.
            </ModernBody>
          </Box>

          {/* Quick Links */}
          <ModernCard className="help-page-card">
            <Stack gap="md">
              <ModernH3>Quick Links</ModernH3>
              <Group gap="md" wrap="wrap">
                <ModernButton
                  variant="secondary"
                  size="sm"
                  leftSection={<IconBook size={18} />}
                  onClick={() => navigateWithTransition('/contact')}
                >
                  Contact Support
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  leftSection={<IconSettings size={18} />}
                  onClick={() => navigateWithTransition('/settings')}
                >
                  Settings
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  leftSection={<IconTicket size={18} />}
                  onClick={() => navigateWithTransition('/matches')}
                >
                  View Matches
                </ModernButton>
              </Group>
            </Stack>
          </ModernCard>

          {/* Getting Started Section */}
          <ModernCard className="help-page-card">
            <Stack gap="lg">
              <Group gap="md">
                <IconBook size={24} color="var(--modern-lime)" />
                <ModernH2>Getting Started</ModernH2>
              </Group>
              <Divider />
              <Stack gap="md">
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    1. Create Your Account
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Sign up for free to start tracking your football journey. You'll need an email address and password.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    2. Explore Matches & Competitions
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Browse live matches, upcoming fixtures, and explore different competitions from around the world.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    3. Track Your Statistics
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Log matches you've attended, goals you've witnessed, and stadiums you've visited to build your personal football profile.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    4. Book Tickets
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Secure tickets for your favorite matches directly through our platform with verified partners.
                  </ModernBody>
                </Box>
              </Stack>
            </Stack>
          </ModernCard>

          {/* FAQs Section */}
          <ModernCard style={{ overflow: 'visible', maxHeight: 'none', height: 'auto' }} className="help-page-card">
            <Stack gap="lg" style={{ width: '100%' }}>
              <Group gap="md">
                <IconQuestionMark size={24} color="var(--modern-lime)" />
                <ModernH2>Frequently Asked Questions</ModernH2>
              </Group>
              <Divider />
              
              {/* Category Filter */}
              <Group gap="sm" wrap="wrap" style={{ width: '100%' }}>
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <ModernButton
                      key={category}
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {category === 'all' ? 'All' : categoryLabels[category as keyof typeof categoryLabels]}
                    </ModernButton>
                  );
                })}
              </Group>

              {/* FAQ Accordion */}
              <Accordion
                variant="separated"
                multiple
                styles={{
                  item: {
                    backgroundColor: 'var(--modern-bg-secondary)',
                    border: '1px solid var(--modern-border-color)',
                    borderRadius: '8px',
                    overflow: 'visible',
                  },
                  control: {
                    color: 'var(--modern-text-primary)',
                    padding: '1rem 1.5rem',
                    '&:hover': {
                      backgroundColor: 'var(--modern-bg-primary)',
                    },
                  },
                  label: {
                    fontWeight: 600,
                    fontSize: '1rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    width: '100%',
                  },
                  content: {
                    color: 'var(--modern-text-primary)',
                    padding: '1rem 1.5rem',
                    opacity: 0.9,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  },
                  chevron: {
                    color: 'var(--modern-lime)',
                    flexShrink: 0,
                  },
                }}
              >
                {filteredFAQs.map((faq) => {
                  const Icon = categoryIcons[faq.category];
                  return (
                    <Accordion.Item key={faq.id} value={faq.id}>
                      <Accordion.Control>
                        <Group gap="sm" wrap="nowrap" style={{ width: '100%', alignItems: 'flex-start' }}>
                          <Box style={{ flexShrink: 0, marginTop: '2px' }}>
                            <Icon size={20} color="var(--modern-lime)" />
                          </Box>
                          <Text 
                            fw={600} 
                            style={{ 
                              flex: 1,
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              minWidth: 0,
                            }}
                          >
                            {faq.question}
                          </Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <ModernBody style={{ lineHeight: 1.7, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                          {faq.answer}
                        </ModernBody>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </Stack>
          </ModernCard>

          {/* Common Issues Section */}
          <ModernCard className="help-page-card">
            <Stack gap="lg">
              <Group gap="md">
                <IconBug size={24} color="var(--modern-lime)" />
                <ModernH2>Common Issues & Solutions</ModernH2>
              </Group>
              <Divider />
              <Stack gap="md">
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Page Won't Load
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Clear your browser cache, disable browser extensions temporarily, and ensure you have a stable internet connection. Try using a different browser if the issue persists.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Scores Not Updating
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Refresh the page to get the latest scores. If scores still aren't updating, there may be a temporary server issue. Check back in a few minutes.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Can't Log In
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Verify your email and password are correct. Use the "Forgot Password" feature if needed. Make sure your account hasn't been locked due to multiple failed login attempts.
                  </ModernBody>
                </Box>
                <Box>
                  <ModernH3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Ticket Booking Issues
                  </ModernH3>
                  <ModernBody style={{ opacity: 0.8 }}>
                    Ensure your payment information is correct and your card hasn't expired. Check that tickets are still available for the match. Contact support if payment is processed but tickets aren't received.
                  </ModernBody>
                </Box>
              </Stack>
            </Stack>
          </ModernCard>

          {/* Contact Section */}
          <ModernCard className="help-page-card">
            <Stack gap="lg">
              <Group gap="md">
                <IconMail size={24} color="var(--modern-lime)" />
                <ModernH2>Still Need Help?</ModernH2>
              </Group>
              <Divider />
              <ModernBody style={{ opacity: 0.8 }}>
                Can't find what you're looking for? Our support team is here to help! Reach out to us through our contact form or email us directly.
              </ModernBody>
              <Group gap="md">
                <ModernButton
                  variant="primary"
                  leftSection={<IconMail size={18} />}
                  onClick={() => navigateWithTransition('/contact')}
                >
                  Contact Support
                </ModernButton>
                <Anchor
                  href="mailto:kenneth_nnadi@aol.co.uk"
                  style={{
                    color: 'var(--modern-lime)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  kenneth_nnadi@aol.co.uk
                </Anchor>
              </Group>
            </Stack>
          </ModernCard>

          {/* Additional Resources */}
          <ModernCard className="help-page-card">
            <Stack gap="lg">
              <ModernH2>Additional Resources</ModernH2>
              <Divider />
              <Stack gap="sm">
                <Group gap="sm">
                  <IconLock size={18} color="var(--modern-lime)" />
                  <Anchor
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Navigate to privacy policy when available
                    }}
                    style={{
                      color: 'var(--modern-lime)',
                      textDecoration: 'none',
                    }}
                  >
                    Privacy Policy
                  </Anchor>
                </Group>
                <Group gap="sm">
                  <IconBook size={18} color="var(--modern-lime)" />
                  <Anchor
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Navigate to terms of service when available
                    }}
                    style={{
                      color: 'var(--modern-lime)',
                      textDecoration: 'none',
                    }}
                  >
                    Terms of Service
                  </Anchor>
                </Group>
                <Group gap="sm">
                  <IconInfoCircle size={18} color="var(--modern-lime)" />
                  <Anchor
                    href="/licenses"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateWithTransition('/licenses');
                    }}
                    style={{
                      color: 'var(--modern-lime)',
                      textDecoration: 'none',
                    }}
                  >
                    Open Source Licenses
                  </Anchor>
                </Group>
              </Stack>
            </Stack>
          </ModernCard>
        </Stack>
      </Container>
    </Box>
  );
}

