import React, { useEffect, useState } from 'react';
import { Container, Title, Text, Stack, Table, ScrollArea, Box, Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';

interface LicenseDependency {
  name: string;
  version: string;
  license: string;
}

interface LicensesData {
  generatedAt: string;
  dependencies: LicenseDependency[];
}

export function LicensesPage() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [licensesData, setLicensesData] = useState<LicensesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch licenses data from public folder
    fetch('/licenses.json')
      .then((res) => res.json())
      .then((data: LicensesData) => {
        setLicensesData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load licenses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Text c={colorScheme === 'dark' ? 'white' : 'dark'}>Loading licenses...</Text>
      </Container>
    );
  }

  if (!licensesData) {
    return (
      <Container size="xl" py="xl">
        <Text c={colorScheme === 'dark' ? 'white' : 'dark'}>Failed to load licenses data.</Text>
      </Container>
    );
  }

  // Sort all dependencies alphabetically
  const sortedDependencies = [...licensesData.dependencies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title order={1} mb="md" c={colorScheme === 'dark' ? 'white' : 'dark'}>
            Licenses
          </Title>
          <Text c="dimmed" size="sm" mb="lg">
            This page lists all open source dependencies used in I Watch Football and their respective licenses.
          </Text>
        </Box>

        <Paper 
          p="md" 
          withBorder
          style={{ 
            backgroundColor: colorScheme === 'dark' 
              ? theme.colors.dark[7] 
              : theme.white,
          }}
        >
          <ScrollArea>
            <Table
              striped
              highlightOnHover
              style={{
                backgroundColor: 'transparent',
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th 
                    c={colorScheme === 'dark' ? 'white' : 'dark'} 
                    style={{ fontWeight: 600 }}
                  >
                    Package Name
                  </Table.Th>
                  <Table.Th 
                    c={colorScheme === 'dark' ? 'white' : 'dark'} 
                    style={{ fontWeight: 600 }}
                  >
                    License
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedDependencies.map((dep) => (
                  <Table.Tr key={dep.name}>
                    <Table.Td>
                      <Text 
                        c={colorScheme === 'dark' ? 'white' : 'dark'} 
                        size="sm" 
                        style={{ fontFamily: 'monospace' }}
                      >
                        {dep.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        c="dimmed" 
                        size="sm"
                      >
                        {dep.license || 'Unknown'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>

        <Box>
          <Text c="dimmed" size="sm">
            Last updated: {new Date(licensesData.generatedAt).toLocaleDateString()}
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}

