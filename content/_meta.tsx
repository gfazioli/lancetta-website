import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import {
  IconBook2,
  IconBulb,
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
  IconBellRinging,
  IconTerminal2,
  IconTools,
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
  // What Lancetta is for comes before the surfaces that show it (0.50.0).
  suggestions: nav(IconBulb, 'Suggestions', 'yellow'),
  'the-menu': nav(IconLayoutNavbar, 'The Panel', 'teal'),
  'the-notch': nav(IconDeviceDesktop, 'The Notch', 'violet'),
  'the-window': nav(IconAppWindow, 'The Window', 'cyan'),
  maintenance: nav(IconTools, 'Maintenance', 'lime'),
  alerts: nav(IconBellRinging, 'Alerts', 'pink'),
  '---how-it-works': { type: 'separator', title: 'How it works' },
  'how-it-reads': nav(IconEye, 'How it reads each agent', 'blue'),
  memory: nav(IconTrash, 'Processes left behind', 'indigo'),
  '---reference': { type: 'separator', title: 'Reference' },
  settings: nav(IconSettings, 'Settings'),
  'command-line': nav(IconTerminal2, 'Command line'),
  privacy: nav(IconLock, 'Privacy'),
  troubleshooting: nav(IconAlertTriangle, 'Troubleshooting', 'red'),
  '---resources': { type: 'separator', title: 'Resources' },
  roadmap: nav(IconMap2, 'What’s next', 'grape'),
  faq: nav(IconHelpCircle, 'FAQ', 'lancetta'),
  'release-notes': '',
  // Reached from the footer's last line on every page, never from the sidebar.
  legal: { display: 'hidden', theme: { pagination: false } },
};
