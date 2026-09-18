'use client';

import { Scene } from '@gfazioli/mantine-scene';
import {
  IconCode,
  IconCpu,
  IconDeviceDesktop,
  IconLayoutNavbar,
  IconPalette,
  IconRefresh,
  IconWindowMinimize,
} from '@tabler/icons-react';
import { Badge, Box, Container, Group, Stack, Text, Title } from '@mantine/core';

/*
 * Only things v0.1 actually is. `Notifications` was here and had to go: it is
 * v0.3, and a pill is a claim exactly as much as a sentence is.
 */
const techPills = [
  { label: 'SwiftUI', icon: IconCode },
  { label: 'Menu Bar Extra', icon: IconLayoutNavbar },
  { label: 'Under the Notch', icon: IconDeviceDesktop },
  { label: 'Light & Dark', icon: IconPalette },
  { label: 'Auto-Refresh', icon: IconRefresh },
  { label: 'Stays Out of the Dock', icon: IconWindowMinimize },
  { label: 'Apple Silicon', icon: IconCpu },
];

export function BuiltForMacSection() {
  return (
    <Box pos="relative" py={80} style={{ overflow: 'hidden' }}>
      {/*
        Aurora + Mesh in the icon's own light: the rim's cyan and violet with
        the plate's azure underneath. Same Sequoia/Tahoe atmosphere the sibling
        sites use, cut on this icon rather than on FinderGit's blue/cyan.
      */}
      <Scene lazy>
        <Scene.Mesh
          stops={[
            { color: '#0546BF', position: '15% 25%', spread: 60 },
            { color: '#672AFA', position: '85% 70%', spread: 58 },
            { color: '#0D7DFA', position: '50% 55%', spread: 75 },
          ]}
          opacity={0.16}
        />
        <Scene.Aurora
          colors={['#13D1FB', '#0D7DFA', '#672AFA']}
          bands={3}
          position="top"
          opacity={0.2}
        />
        <Scene.Noise opacity={0.018} />
      </Scene>
      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap="md">
          <Text
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
          >
            Built for macOS
          </Text>
          <Title order={2} ta="center" fz={{ base: 32, sm: 42 }} fw={900}>
            A menu-bar app, and nothing more than one.
          </Title>

          <Group justify="center" gap="sm" mt="lg" maw={700}>
            {techPills.map((pill) => (
              <Badge
                key={pill.label}
                size="xl"
                variant="light"
                color="gray"
                radius="xl"
                leftSection={<pill.icon size={16} />}
                styles={{
                  root: {
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                }}
              >
                {pill.label}
              </Badge>
            ))}
          </Group>

          <Text c="dimmed" ta="center" size="lg" maw={620} mt="lg">
            No Electron, and no window you have to keep open. Native SwiftUI that sits in the menu
            bar and gets out of the way — and on a MacBook Pro, one thin bar per agent under the
            notch.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
