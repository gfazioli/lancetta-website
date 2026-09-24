import { compileReleaseBodies } from './load-releases';
import type { Release } from './use-release-notes';

// The real compiler is ESM and needs a Node environment; the branch under test
// is what this hook does AROUND it, so it is injected instead. What the real one
// does with each format was measured against the live release bodies and is
// recorded on `MARKDOWN` in load-releases.ts.
jest.mock('nextra/compile', () => ({ compileMdx: jest.fn() }), { virtual: true });

function release(tag: string, body: string): Release {
  return {
    tag_name: tag,
    body,
    id: tag.length,
    created_at: '2026-09-18T10:00:00Z',
    published_at: '2026-09-18T10:00:00Z',
  } as unknown as Release;
}

describe('compileReleaseBodies', () => {
  it('reads a release body as markdown, so a brace is never JavaScript', async () => {
    const compile = jest.fn(async () => 'compiled');
    await compileReleaseBodies([release('v1.0.0', 'hello')], compile as any);
    // The defect was compiling as MDX: `{ code = "-32600" }` in Lancetta 0.3.3
    // is a JS expression there, and an unparsable one.
    expect(compile).toHaveBeenCalledWith('hello', { mdxOptions: { format: 'md' } });
  });

  it('lets one uncompilable body cost only its own formatting', async () => {
    const compile = jest.fn(async (body: string) => {
      if (body.includes('{')) {
        throw new Error('Could not parse expression with acorn');
      }
      return `compiled:${body}`;
    });

    const out = await compileReleaseBodies(
      [
        release('v0.3.3', 'quoting { code = "-32600" } verbatim'),
        release('v0.3.2', 'a well behaved body'),
      ],
      compile as any
    );

    // Before the fix this rejected, the hook never became ready, and the page
    // showed "Loading releases..." for ever -- hiding BOTH releases.
    expect(out).toHaveLength(2);
    expect(out[1].body).toBe('compiled:a well behaved body');
    expect(out[0].body).toBeNull();
    expect(out[0].rawBody).toBe('quoting { code = "-32600" } verbatim');
  });

  it('keeps the raw body of a release GitHub published empty', async () => {
    const compile = jest.fn(async () => 'compiled');
    const out = await compileReleaseBodies(
      [{ ...release('v1.0.0', ''), body: null } as unknown as Release],
      compile as any
    );
    expect(out[0].rawBody).toBe('');
    expect(compile).toHaveBeenCalledWith('', { mdxOptions: { format: 'md' } });
  });
});
