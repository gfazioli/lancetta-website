/**
 * @jest-environment node
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * How many checks Maintenance runs, and how many kinds of finding it fixes by
 * itself, are typed by hand wherever the site says them: the docs page's
 * heading and description, every link to that heading (its anchor carries the
 * number), the hero's figure and the sentence beside it, and the FAQ. The hero
 * once read "25 checks" beside a figure still saying 24, and nothing failed.
 * The reference is each table on the docs page, one row per check (AgentsKit's
 * `AgentCheck`) and one per fix. The roadmap's shipped entries keep the count
 * of their day, so there only the links are held to it.
 */
describe('the counts Maintenance is described by', () => {
  const root = join(__dirname, '../..');
  const read = (path: string) => readFileSync(join(root, path), 'utf8');
  const docs = read('content/maintenance.mdx');
  /** The data rows of the first table after `heading`. */
  const rows = (heading: RegExp) =>
    (docs.split(heading)[1]?.split(/^#{2,3} /m)[0] ?? '')
      .split('\n')
      .filter((line) => line.startsWith('| ')).length - 1;
  const checks = String(rows(/^## The \d+ checks$/m));

  it('is the rows of the checks table, and its heading', () => {
    expect(Number(checks)).toBeGreaterThan(0);
    expect(docs.match(/^## The (\d+) checks$/m)?.[1]).toBe(checks);
  });

  it('is what the hero figure says', () => {
    const hero = read('components/HeroStage/HeroStage.tsx');
    expect(hero.match(/value: '(\d+)', label: 'checks, each with its reason'/)?.[1]).toBe(checks);
  });

  it('is every “N checks” and every link to the checks', () => {
    const pages = readdirSync(join(root, 'content'))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => `content/${f}`);
    const said = [
      ...pages,
      'components/HeroStage/HeroStage.tsx',
      'components/FAQ/faq-items.ts',
    ].flatMap((f) => {
      const pattern =
        f === 'content/roadmap.mdx'
          ? /\[The (\d+) checks\]|#the-(\d+)-checks\b/g
          : /\b(\d+) checks\b|#the-(\d+)-checks\b/g;
      return [...read(f).matchAll(pattern)].map((m) => ({ f, n: m[1] ?? m[2] }));
    });
    expect(said.length).toBeGreaterThan(5);
    expect(said.filter(({ n }) => n !== checks)).toEqual([]);
  });

  it('says as many kinds of fix as the fixes table has rows', () => {
    const words = 'zero one two three four five six seven eight nine ten eleven twelve'.split(' ');
    const fixes = words[rows(/^### When the fix needs no choosing$/m)];
    const said = [docs, read('components/FAQ/faq-items.ts')].flatMap((text) =>
      [...text.matchAll(/\b(\w+) kinds of finding\b/g)].map((m) => m[1].toLowerCase())
    );
    expect(said).toHaveLength(2);
    expect(said.filter((w) => w !== fixes)).toEqual([]);
  });
});
