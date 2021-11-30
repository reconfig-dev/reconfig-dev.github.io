// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Syed Tousif Ahmed',
  tagline: 'Computer Engineer',
  url: 'https://syed-ahmed.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: false,
  organizationName: 'syed-ahmed', // Usually your GitHub org/user name.
  projectName: 'syed-ahmed.github.io', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          path: './docs',
          routeBasePath: '/',
        },
        blog: {
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Syed Tousif Ahmed.`,
          },
          blogTitle: 'Reconfig',
          blogDescription: 'Technical Articles on Reconfigurable Computing.',
          path: './blog',
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/syed-ahmed/syed-ahmed.github.io/edit/main/reconfig/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Syed Tousif Ahmed',
          },
          {to: '/blog', label: 'Blog', position: 'right'},
          {
            href: 'https://syed-ahmed.github.io/rss.xml',
            position: 'right',
            className: 'header-rss-link',
          },
          {
            href: 'https://github.com/syed-ahmed/',
            position: 'right',
            className: 'header-github-link',
          },
          {
            href: 'https://twitter.com/tousifsays',
            position: 'right',
            className: 'header-twitter-link',
          },
        ],
      },
      footer: {
        style: 'light',
        copyright: `Copyright © ${new Date().getFullYear()} Syed Tousif Ahmed.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
