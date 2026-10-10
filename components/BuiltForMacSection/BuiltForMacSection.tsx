'use client';

import {
  IconBellRinging,
  IconCode,
  IconCpu,
  IconDeviceDesktop,
  IconLanguage,
  IconLayoutNavbar,
  IconPalette,
  IconRefresh,
  IconWindowMinimize,
} from '@tabler/icons-react';
import { Badge, Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import { revealItem, revealScope } from '../Motion/Reveal';
import { useReveal } from '../Motion/useReveal';

/*
 * Only things the shipped build actually is. `Notifications` was here, had to
 * go while "It speaks first" was still ahead -- a pill is a claim exactly as
 * much as a sentence is -- and is back since v0.5 shipped it.
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
 *
 * `7 Languages` arrived with v0.14 and is checkable the same way: one
 * `<lang>.lproj` per language in the shipped bundle's Resources, and the list
 * is `../Lancetta/scripts/i18n/i18n.py langs` plus English.
 */
const techPills = [
  { label: 'SwiftUI', icon: IconCode },
  { label: 'Menu Bar Extra', icon: IconLayoutNavbar },
  { label: 'Under the Notch', icon: IconDeviceDesktop },
  { label: 'Light & Dark', icon: IconPalette },
  { label: 'Auto-Refresh', icon: IconRefresh },
  { label: 'No Dock Icon at Rest', icon: IconWindowMinimize },
  { label: 'Universal', icon: IconCpu },
  { label: 'Notifications', icon: IconBellRinging },
  { label: '7 Languages', icon: IconLanguage },
];

export function BuiltForMacSection() {
  // One scope for the whole block: the heading lifts in, the pills pop one after
  // another, and the line under them follows the last.
  const reveal = useReveal<HTMLDivElement>();
  return (
    <Box pos="relative" py={80} className="lan-feather" style={{ overflow: 'hidden' }}>
      <Container size="lg" pos="relative" style={{ zIndex: 1 }}>
        <Stack ref={reveal.ref} align="center" gap="md" {...revealScope(reveal)}>
          <Text
            {...revealItem('rise')}
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: 3, color: 'var(--lan-accent)' }}
          >
            Built for macOS
          </Text>
          <Title {...revealItem('rise', 80)} order={2} ta="center" fz={{ base: 32, sm: 42 }}>
            A menu-bar app, and nothing more than one.
          </Title>

          {/* 780, not 700: with the ninth pill, 700 left it alone on a third row at desktop width; 780 gives five over four. */}
          <Group justify="center" gap="sm" mt="lg" maw={780}>
            {techPills.map((pill, i) => (
              <Badge
                key={pill.label}
                {...revealItem('pop', 240 + i * 60)}
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

          <Text
            {...revealItem('rise', 240 + techPills.length * 60)}
            c="dimmed"
            ta="center"
            size="lg"
            maw={620}
            mt="lg"
          >
            No Electron, and no window you have to keep open. Native SwiftUI that sits in the menu
            bar and gets out of the way — and on a MacBook Pro, one thin bar per agent under the
            notch. It speaks your Mac’s language: English, Italian, French, German, Spanish,
            Portuguese or Dutch.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
