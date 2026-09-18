import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import {
  IconBook2,
  IconRocket,
  IconLayoutNavbar,
  IconDeviceDesktop,
  IconAppWindow,
  IconEye,
  IconTrash,
  IconMap2,
  IconSettings,
  IconLock,
  IconHelpCircle,
  IconAlertTriangle,
} from '@tabler/icons-react';

// Sidebar entry with a leading icon. The icon inherits `currentColor`, so it
// tracks the link's active/hover colour automatically — which is why the label
// stays a bare string (a Mantine `Text` would impose its own colour token and
// break that inheritance).
function nav(Icon: typeof IconBook2, label: string, color?: string): { title: ReactNode } {
  return {
    title: (
      <Group component="span" gap={8} wrap="nowrap" align="center">
        <Icon
          size={16}
          stroke={1.8}
          color={color ? `var(--mantine-color-${color}-6)` : undefined}
        />
        {label}
      </Group>
    ),
  };
}

export default {
  index: nav(IconBook2, 'Introduction', 'lancetta'),
  '---get-started': { type: 'separator', title: 'Get Started' },
  'getting-started': nav(IconRocket, 'Getting Started', 'orange'),
  'the-menu': nav(IconLayoutNavbar, 'The Menu', 'teal'),
  'the-notch': nav(IconDeviceDesktop, 'The Notch', 'violet'),
  'the-window': nav(IconAppWindow, 'The Window', 'cyan'),
  '---how-it-works': { type: 'separator', title: 'How it works' },
  'how-it-reads': nav(IconEye, 'How it reads each agent', 'blue'),
  memory: nav(IconTrash, 'Processes left behind', 'indigo'),
  '---reference': { type: 'separator', title: 'Reference' },
  settings: nav(IconSettings, 'Settings'),
  privacy: nav(IconLock, 'Privacy'),
  troubleshooting: nav(IconAlertTriangle, 'Troubleshooting', 'red'),
  '---resources': { type: 'separator', title: 'Resources' },
  roadmap: nav(IconMap2, 'What’s next', 'grape'),
  faq: nav(IconHelpCircle, 'FAQ', 'lancetta'),
  'release-notes': '',
};
