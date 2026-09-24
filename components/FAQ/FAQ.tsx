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
import classes from './FAQ.module.css';

/*
 * Every answer here is a claim someone can check, so each one has to be true
 * of the build that is actually shipping. Two rules when editing:
 *
 *  - Do not describe a feature in the present tense until it ships. As of
 *    2026-09-22 everything the roadmap once listed ahead of "Everyone else's
 *    Mac" has shipped, the notifications included (v0.5). This list goes
 *    stale silently: check the app's own CLAUDE.md and git log, not this
 *    comment.
 *  - `faqItems` is paired with the FAQPage JSON-LD in StructuredData.tsx.
 *    Change one and change the other, or the rich result quotes an answer
 *    that is no longer on the page.
 */
export const faqItems: { value: string; question: string; answer: ReactNode }[] = [
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
      'No, and that is the constraint the whole app is built around. Codex answers an account question directly — measured over twelve reads, the lifetime token counter did not move by one. Claude’s numbers come from one account read, made with the sign-in Claude Code keeps on your Mac — the same request Claude Code’s own /usage makes, with no model in the loop. Asking a model how much quota is left would cost tokens on every poll, and it is the one route Lancetta will never take.',
  },
  {
    value: 'agents',
    question: 'Which agents does it support?',
    answer:
      'Codex and Claude Code today. A new agent needs code that can read its quota without spending any, which is the whole constraint — so agents arrive with the app rather than being added by hand in Settings.',
  },
  {
    value: 'different',
    question: 'How is it different from the other quota monitors?',
    answer:
      'Advice about a quota needs three things: the ceiling (what your real limit is), the flow (what you have spent), and the series (how that percentage moved over time). The good tools in this space have the first two. The series is the one nobody keeps — a monitor that reads your transcripts has no way to learn the ceiling at all and infers it from your own highest previous block, and one that covers dozens of providers cannot store a series per provider per window and stay maintainable. Lancetta watches two agents instead of dozens and keeps the series for both, which is the only reason it can say where this pace lands against the percentage your account actually reports rather than an inferred one. It is also the part that cannot be added later: history only accumulates forward.',
  },
  {
    value: 'refresh',
    question: 'Can I refresh Claude on demand, like Codex?',
    answer:
      'Yes, once it is connected: one click in the menu, and macOS asks once whether Lancetta may read the sign-in Claude Code keeps. From then on Claude answers an account read the way Codex does, on the same interval and on Refresh now. Through the status-line file instead, the numbers arrive when a session renders one, and the card shows how old they are rather than pretending to be live.',
  },
  {
    value: 'stale',
    question: 'What happens when a reading goes stale?',
    answer:
      'It says so. Every reading carries the time it was taken, and an unknown is drawn as an unknown — never as 0%. A status line rendering an unknown as zero, and a three-hour-old number as current, is the defect this app exists because of.',
  },
  {
    value: 'model-limit',
    question: 'Claude says I am out, but Lancetta shows two thirds left. Which is right?',
    answer:
      'Both, and that gap is what Lancetta 0.6 exists to close. Some plans give one model a weekly limit of its own, counted separately from the window every monitor reads — so the model you actually want can be spent while the general window is comfortable. The account sends that limit as a row of its own, and Lancetta now draws it under the name your account gives it, with a sentence when its week is spent, when it is back, and when it is heading for empty before it resets. It needs the account route: the status-line file carries the two general windows and nothing else.',
  },
  {
    value: 'interrupt',
    question: 'Will it interrupt me?',
    answer:
      'Only about what the menu bar cannot already show. The percentage is on your bar, so Lancetta never announces it; it speaks first when a window will run out before it resets — naming the reset beside the moment it runs out — when an agent has nothing left, when it is ready again, when a reading has stopped moving while looking live, and when Codex grants you a free reset. Each once, at the moment it changes, and never on launch — except for a free reset granted while Lancetta was closed, which is news rather than a state. macOS is asked for permission the first time there is actually something to say. Alerts and suggestions are separate switches, each agent has its own, and a sound is reserved for the two moments you are not looking at a screen.',
  },
  {
    value: 'surfaces',
    question: 'Is Lancetta only in the menu bar?',
    answer:
      'Mostly, and that is the point. There is also a window — ⌘O from the menu — with the daily token chart, both agents in detail, and the background processes the agents have left running. A Dock icon appears while that window is open and goes again when you close it, because a window needs its app to be a normal one; at rest Lancetta keeps nothing in the Dock, and closing the window quits nothing. On a MacBook Pro the reading also sits under the notch.',
  },
  {
    value: 'memory',
    question: 'What about the processes the agents leave behind?',
    answer:
      'Coding agents leave a background process tree behind for every folder they worked in, and nothing ever reaps them: close the folder before the session ends and nothing is ever told to stop. Measured once on one Mac: 28 processes holding 2.68 GB, 12 of them serving folders that had already been deleted. Lancetta lists them and reclaims that memory on your say-so — and it always shows you what it is about to stop before it stops it.',
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
    question: 'Where do I download it?',
    answer: (
      <>
        <Anchor href="/download" size="sm">
          The download button
        </Anchor>{' '}
        takes you straight to the latest DMG. It is signed with an Apple Developer ID and notarized
        by Apple, so it opens without the detour Gatekeeper puts unsigned apps through, and it
        updates itself from then on.{' '}
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
  },
];

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
export const faqQuestions = faqItems.map((i) => i.question);
