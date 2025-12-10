// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Aksha MD Editor',
  tagline: 'A highly optimized production-ready Markdown Editor for React',
  favicon: 'https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/aksha-md-editor-logo.png',

  // Set the production url of your site here
  url: 'https://Nil369.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/aksha-md-editor/',

  // GitHub pages deployment config.
  organizationName: 'yourusername', // Usually your GitHub org/user name.
  projectName: 'aksha-md-editor', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/yourusername/aksha-md-editor/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.jpg',
      navbar: {
        title: 'Aksha MD Editor',
        logo: {
          alt: 'Aksha MD Editor Logo',
          src: 'https://ik.imagekit.io/AkashPortfolioAssets/product_demo_videos/aksha_docs/aksha-md-editor-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: '/docs/api-reference',
            label: 'API',
            position: 'left',
          },
          {
            href: 'https://github.com/Nil369/aksha-md-editor',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'API Reference',
                to: '/docs/api-reference',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Nil369/aksha-md-editor',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/aksha-md-editor',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Changelog',
                href: 'https://github.com/Nil369/aksha-md-editor/blob/main/CHANGELOG.md',
              },
              {
                label: 'Akash Halder Technologia',
                href: 'https://akashhalder.in/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Aksha MD Editor.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
