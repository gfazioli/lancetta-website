'use client';

import type { ReactNode } from 'react';
import { Accordion, Anchor, Text } from '@mantine/core';

/*
 * Every answer here is a claim someone can check, so each one has to be true
 * of the build that is actually shipping. Two rules when editing:
 *
 *  - Do not describe the process reaper, notifications or auto-updates in the
 *    present tense until they ship. They are v0.2, v0.3 and v0.4.
 *  - `faqItems` is paired with the FAQPage JSON-LD in StructuredData.tsx.
 *    Change one and change the other, or the rich result quotes an answer
 *    that is no longer on the page.
 */
const faqItems: { value: string; question: string; answer: ReactNode }[] = [
  {
    value: 'what',
    question: 'What is Lancetta?',
    answer:
      'Lancetta is a native macOS menu-bar app that shows how much quota your coding agents have left. It reads Codex and Claude Code, draws the 5-hour and the 7-day window for each, and tells you when each one resets — without you opening a terminal to ask.',
  },
  {
    value: 'name',
    question: 'Why “Lancetta”?',
    answer:
      'A lancetta is the hand of an instrument — the needle that says where you are. It names what the app does rather than which tools it happens to watch, which is why it survives a third and a fourth agent.',
  },
  {
    value: 'tokens',
    question: 'Does Lancetta spend tokens to read my quota?',
    answer:
      'No, and that is the constraint the whole app is built around. Codex answers an account question directly — measured over twelve reads, the lifetime token counter did not move by one. Claude Code’s numbers arrive in a payload it already produces for its own status line, so there is no request to bill. Asking a model how much quota is left would cost tokens on every poll, and it is the one route Lancetta will never take.',
  },
  {
    value: 'agents',
    question: 'Which agents does it support?',
    answer:
      'Codex and Claude Code today. A new agent needs code that can read its quota without spending any, which is the whole constraint — so agents arrive with the app rather than being added by hand in Settings.',
  },
  {
    value: 'refresh',
    question: 'Why can I refresh Codex on demand but not Claude?',
    answer:
      'Because they are not symmetrical. Codex can be asked a question and will answer. Claude Code has no equivalent — its quota numbers exist only in what it hands its own status line, so they arrive when a session renders one. Lancetta says which of the two you are looking at rather than pretending they behave the same.',
  },
  {
    value: 'stale',
    question: 'What happens when a reading goes stale?',
    answer:
      'It says so. Every reading carries the time it was taken, and an unknown is drawn as an unknown — never as 0%. A status line rendering an unknown as zero, and a three-hour-old number as current, is the defect this app exists because of.',
  },
  {
    value: 'memory',
    question: 'What is the memory half?',
    answer:
      'Coding agents leave a background process tree behind for every folder they worked in, and nothing ever reaps them: close the folder before the session ends and nothing is ever told to stop. Measured once on one Mac: 28 processes holding 2.68 GB, 12 of them serving folders that had already been deleted. Lancetta will list them and let you reclaim the memory — that lands in v0.2, and it will always show you what it is about to stop before it stops it.',
  },
  {
    value: 'privacy',
    question: 'Does anything leave my Mac?',
    answer:
      'No. Lancetta reads what is already on your machine and draws it in your menu bar. There is no account, no server and no telemetry — nothing is sent anywhere.',
  },
  {
    value: 'macos',
    question: 'What macOS version do I need?',
    answer:
      'macOS 15 (Sequoia) or later. The notch panel needs a Mac that has a notch; on any other Mac that pane is hidden entirely, and the menu-bar item works the same everywhere.',
  },
  {
    value: 'marks',
    question: 'Are those the real Codex and Claude logos?',
    answer:
      'They are the vendors’ own marks, drawn from vector data so they stay sharp at any size, and used nominatively — to name the products Lancetta reads. Lancetta is not affiliated with, or endorsed by, OpenAI or Anthropic, and one switch in Settings replaces the whole menu with neutral system symbols.',
  },
  {
    value: 'price',
    question: 'What does it cost?',
    answer: (
      <>
        Lancetta is free. If you find it useful, consider{' '}
        <Anchor href="https://github.com/sponsors/gfazioli" size="sm">
          sponsoring the project
        </Anchor>
        .
      </>
    ),
  },
  {
    value: 'when',
    question: 'When can I download it?',
    answer: (
      <>
        Not yet — v0.1 is still being built, and this site goes up before the first release rather
        than after it. The{' '}
        <Anchor href="/docs/roadmap" size="sm">
          roadmap
        </Anchor>{' '}
        says what is in each version, and the{' '}
        <Anchor href="https://github.com/gfazioli/lancetta-website/releases" size="sm">
          releases page
        </Anchor>{' '}
        is where the first build will appear.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <Accordion variant="separated" radius="md">
      {faqItems.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Control>
            <Text fw={600}>{item.question}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text c="dimmed" size="sm" lh={1.65}>
              {item.answer}
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

/** Exported for the FAQPage JSON-LD, which must quote what the page shows. */
export const faqQuestions = faqItems.map((i) => i.question);
