'use client';

import type { ReactNode } from 'react';
import {
  IconCoins,
  IconDownload,
  IconGift,
  IconInfoCircle,
  IconShieldLock,
  type Icon,
} from '@tabler/icons-react';
import { Accordion, Anchor, Text } from '@mantine/core';
import { discordLinkProps } from '@/components/Discord/discord';
import { faqEntries, faqQuestions } from './faq-items';
import classes from './FAQ.module.css';

/*
 * The answers the page draws with links. Everything else, and the plain text
 * of these three, is `faq-items.ts`, which the JSON-LD quotes too; FAQ.test
 * holds each of these to its plain text there.
 */
export const richAnswers: Partial<Record<string, ReactNode>> = {
  price: (
    <>
      Lancetta is free. If you find it useful, consider{' '}
      <Anchor href="https://github.com/sponsors/gfazioli" size="sm">
        sponsoring the project
      </Anchor>
      .
    </>
  ),
  community: (
    <>
      Yes, on{' '}
      <Anchor {...discordLinkProps} size="sm">
        Discord
      </Anchor>
      , where Lancetta and its sibling apps live: get help, suggest features, vote on what comes
      next and talk directly with the maker.
    </>
  ),
  when: (
    <>
      <Anchor href="/download" size="sm">
        The download button
      </Anchor>{' '}
      takes you straight to the latest DMG. It is signed with an Apple Developer ID and notarized by
      Apple, so it opens without the detour Gatekeeper puts unsigned apps through, and it updates
      itself from then on.{' '}
      <Anchor href="/docs/roadmap" size="sm">
        What’s next
      </Anchor>{' '}
      says what has shipped and what is being built, and every build is on the{' '}
      <Anchor href="https://github.com/gfazioli/lancetta-website/releases" size="sm">
        releases page
      </Anchor>
      .
    </>
  ),
};

export const faqItems: { value: string; question: string; answer: ReactNode }[] = faqEntries.map(
  (entry) => ({ ...entry, answer: richAnswers[entry.value] ?? entry.answer })
);

/*
 * A small icon on the questions a visitor most likely came with (user,
 * 2026-09-23: on the most important ones, not on every one). Keyed by the
 * item's `value`, so the list the JSON-LD reads stays exactly as it is.
 */
const faqIcons: Partial<Record<string, Icon>> = {
  what: IconInfoCircle,
  tokens: IconCoins,
  privacy: IconShieldLock,
  price: IconGift,
  when: IconDownload,
};

export function FAQ() {
  return (
    <Accordion
      variant="separated"
      radius="md"
      classNames={{ root: classes.root, item: classes.item }}
      // Mantine 9 keeps a closed panel in a React <Activity>, which renders
      // nothing on the server: the served markup carried the 16 questions and
      // not one answer (only the JSON-LD mirror had them), and Google left
      // pages of the sibling sites "Crawled - currently not indexed"
      // (2026-09-24). `display-none` renders every answer and only hides it.
      keepMountedMode="display-none"
    >
      {faqItems.map((item) => {
        const ItemIcon = faqIcons[item.value];
        return (
          <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control
              icon={
                ItemIcon && (
                  <span className={classes.icon} aria-hidden>
                    <ItemIcon size={16} stroke={1.8} />
                  </span>
                )
              }
            >
              <Text fw={600}>{item.question}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text c="dimmed" size="sm" lh={1.65}>
                {item.answer}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

/** Exported for the FAQPage JSON-LD, which must quote what the page shows. */
export { faqQuestions };
