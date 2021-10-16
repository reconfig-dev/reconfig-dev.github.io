// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Reconfig',
  tagline: 'Technical Articles about Reconfigurable Computing',
  url: 'https://reconfig.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  trailingSlash: false,
  organizationName: 'reconfig-dev', // Usually your GitHub org/user name.
  projectName: 'reconfig', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Syed Tousif Ahmed.`,
          },
          blogTitle: 'Reconfig',
          blogDescription: 'Technical Articles about Reconfigurable Computing.',
          path: './blog',
          routeBasePath: '/',
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/reconfig-dev/reconfig/edit/main/reconfig/blog/',
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
        logo: {
          alt: 'Reconfig logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://reconfig.dev/rss.xml',
            label: 'RSS',
            position: 'right',
          },
          {
            href: 'https://reconfig.dev/atom.xml',
            label: 'Atom',
            position: 'right',
          },
          {href: './', label: 'Technical Articles on Reconfigurable Computing', position: 'left'},
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
