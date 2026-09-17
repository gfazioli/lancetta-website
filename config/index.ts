export default {
  metadata: {
    title: {
      // 57 characters — inside the 50–60 OG/SERP sweet spot. "Menu-Bar"
      // and "Coding Agents" both pull weight in the click decision: the
      // first says where it lives, the second who it watches. "Quota"
      // carries the search intent, and it is the ONE job: the reaper is a
      // feature, and neither the title nor the description sells it.
      default: 'Lancetta — Menu-Bar Quota Monitor for Coding Agents',
      template: '%s | Lancetta',
    },
    description:
      'A native macOS menu-bar monitor for Codex and Claude Code. See both quota windows, the plan each account is on, and how old every reading is — without spending a single token to find out.',
    metadataBase: new URL('https://lancetta.app/'),
    keywords: [
      'Lancetta',
      'macOS',
      'menu bar',
      'Codex',
      'Claude Code',
      'coding agent',
      'quota monitor',
      'rate limit',
      'token usage',
      'SwiftUI',
      'developer tools',
    ],
    generator: 'Next.js',
    applicationName: 'Lancetta',
    appleWebApp: {
      title: 'Lancetta',
    },
    openGraph: {
      url: './',
      siteName: 'Lancetta',
      locale: 'en_US',
      type: 'website',
    },
    other: {
      'msapplication-TileColor': '#7a5bea',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gfazioli',
      creator: '@gfazioli',
    },
    alternates: {
      canonical: './',
    },
  },
  nextraLayout: {
    docsRepositoryBase: 'https://github.com/gfazioli/lancetta-website/tree/main/content/',
    sidebar: {
      defaultMenuCollapseLevel: 1,
    },
  },
  head: {
    mantine: {
      defaultColorScheme: 'dark',
      nonce: '8IBTHwOdqNKAWeKl7plt8g==',
    },
  },
  gitHub: {
    // The app repo is PRIVATE, so releases are published on this website
    // repo — the same arrangement FinderGit and Netfox run.
    repo: 'gfazioli/lancetta-website',
    apiUrl: 'https://api.github.com',
    releasesUrl: 'https://api.github.com/repos/gfazioli/lancetta-website/releases',
  },
  releaseNotes: {
    url: 'https://github.com/gfazioli/lancetta-website/releases',
    maxReleases: 10,
    // release.sh will name every app release "Lancetta X.Y.Z"; the feed keeps
    // only releases with this name prefix, so a website-internal release (the
    // Mantine/Nextra template tags its own) never appears in the app's notes.
    appReleaseNamePrefix: 'Lancetta',
    displayCount: 3,
  },
  search: {
    queryKeyword: 'q',
    minQueryLength: 3,
    limitKeyword: 'limit',
    defaultMaxResults: 5,
    excerptLengthKeyword: 'excerptLength',
    defaultExcerptLength: 30,
    defaultLanguage: 'en',
  },
  app: {
    // Every field here is written by the app's `scripts/release.sh`, which reads them
    // off the BUILT .app rather than off a build setting — what the product declares
    // about itself cannot disagree with what runs. Do not hand-edit them: a
    // hand-kept copy of a value the pipeline owns is the copy that drifts, and
    // netfox.app shipped exactly that (a minMacOS nobody could see, wrong for a
    // whole release, published to search engines as the supported OS).
    //
    // `released` gates the Download tab, the hero button and the JSON-LD download
    // claim. It went true with the first release, v0.2.0 on 2026-09-18 — v0.2 and
    // not v0.1 because the memory half planned for later landed in the same build.
    version: '0.2.2',
    released: true,
    releaseDate: '2026-09-18',
    minMacOS: '15.0',
    // The FALLBACK for `/download`, which normally resolves the newest release's
    // .dmg from the GitHub API. A failure there lands the reader on the releases
    // page rather than on nothing.
    downloadUrl: 'https://github.com/gfazioli/lancetta-website/releases/latest',
  },
} as const;
