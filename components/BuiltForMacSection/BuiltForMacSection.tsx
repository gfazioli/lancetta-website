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
 * Only things the shipped build actually is. `Notifications` was here and had
 * to go: it is still ahead ("It speaks first"), and a pill is a claim exactly
 * as much as a sentence is.
 *
 * Two of them were wrong claims until 2026-09-21, and both failed in the
 * direction a reader cannot check:
 *
 * - **"Stays Out of the Dock"** is the short version of the Dock behaviour,
 *   and the short version is false: a Dock icon appears while the window is
 *   open, because a window needs a `.regular` app to have its own menu bar.
 *   Four pages say so correctly (the-window, getting-started, settings, FAQ)
 *   and this pill was the last place still saying the flat thing.
 * - **"Apple Silicon"** under-claimed the binary and contradicted the hero on
 *   the same page, which reads `Universal`. Measured on the shipped 0.4.0
 *   bundle: `lipo -archs` answers `x86_64 arm64`. An Intel Mac on macOS 15 can
 *   run this and the pill was telling its owner otherwise.
 *
 * Both are checkable in one command each. Check them rather than tidying the
 * wording.
 */
const techPills = [
  { label: 'SwiftUI', icon: IconCode },
  { label: 'Menu Bar Extra', icon: IconLayoutNavbar },
  { label: 'Under the Notch', icon: IconDeviceDesktop },
  { label: 'Light & Dark', icon: IconPalette },
  { label: 'Auto-Refresh', icon: IconRefresh },
  { label: 'No Dock Icon at Rest', icon: IconWindowMinimize },
  { label: 'Universal', icon: IconCpu },
];

export function BuiltForMacSection() {
  return (
    <Box pos="relative" py={80} className="lan-feather" style={{ overflow: 'hidden' }}>
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
