'use client';

import { IconBrandGithub, IconPackage, IconRocket } from '@tabler/icons-react';
import { MDXRemote } from 'nextra/mdx-remote';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Skeleton,
  Stack,
  Text,
  Timeline,
} from '@mantine/core';
import config from '@/config';
import { useMDXComponents } from '@/mdx-components';
import { useReleaseNotes, type Release } from './use-release-notes';

/**
 * What the page says while there is nothing to list. Tied to `config.app.released`
 * so the sentence changes by itself the day the first build ships: before it, the
 * honest state is "not yet", not a spinner.
 */
export function NoReleasesYet() {
  return (
    <Alert
      my={32}
      icon={<IconRocket size={18} />}
      title={config.app.released ? 'No release notes yet' : 'Nothing released yet'}
      color="lancetta"
      variant="light"
    >
      {config.app.released ? (
        <Text size="sm">
          The first release is out, but its notes have not been published on GitHub yet. They appear
          here the moment they are.
        </Text>
      ) : (
        <Text size="sm">
          Lancetta v{config.app.version} is still being built. The{' '}
          <Anchor href="/docs/roadmap">roadmap</Anchor> says what is in it, and the first release
          will appear here, fetched from GitHub, the day it ships.
        </Text>
      )}
    </Alert>
  );
}

export function ReleaseNotes() {
  const { data, error, isLoading, ready } = useReleaseNotes();

  const components = useMDXComponents();

  if (error) {
    return (
      <Alert my={32} icon="⚠️" title="Failed to load releases" color="red">
        {error}
      </Alert>
    );
  }

  // Loading and empty are DIFFERENT screens. Folding them together is how a
  // repo with no releases yet showed "Loading releases..." forever, with
  // skeletons that never resolved, on a live site.
  if (isLoading || !ready) {
    return (
      <Stack mt={24} w="100%" align="center">
        <Group>
          <Text>Loading releases...</Text>
          <Loader type="dots" />
        </Group>
        <Skeleton height={200} width="100%" radius={12} />
        <Skeleton height={50} width="100%" radius={12} />
        <Skeleton height={20} width="100%" radius={12} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return <NoReleasesYet />;
  }

  return (
    <Stack mt={24}>
      <Timeline active={1} bulletSize={32} lineWidth={4}>
        {data.map((release: Release) => (
          <Timeline.Item
            id={release.tag_name}
            className="x:tracking-tight x:target:animate-[fade-in_1.5s]"
            key={release.id}
            bullet={<IconPackage size={20} />}
            title={<Badge size="xl">{release.tag_name}</Badge>}
          >
            <Text size="sm" fw={800} mb={16}>
              {release.displayDate}
            </Text>
            <MDXRemote compiledSource={release.body} components={components} />
          </Timeline.Item>
        ))}
      </Timeline>
      <Button
        color="orange"
        component="a"
        href={config.releaseNotes.url}
        variant="gradient"
        size="sm"
        gradient={{ from: 'dark.9', to: 'dark.8', deg: 45 }}
        leftSection={<IconBrandGithub size={18} />}
        radius="xl"
      >
        View full changelog on GitHub
      </Button>
    </Stack>
  );
}
