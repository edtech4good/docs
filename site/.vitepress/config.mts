import { defineConfig } from 'vitepress'

export default defineConfig({
    base: '/docs/',
    title: 'edtech4good',
    description: 'Documentation for edtech4good, an open-source offline-first learning platform for classrooms with low resources',
    lang: 'en',
    cleanUrls: true,
    lastUpdated: false,
    ignoreDeadLinks: false,
    head: [
      ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      ['meta', { name: 'theme-color', content: '#0B5FFF' }]
    ],
    themeConfig: {
      search: {
        provider: 'local'
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/edtech4good' }
      ],
      footer: {
        message: 'Documentation under CC BY 4.0. Code under AGPL-3.0-only.',
        copyright: '© edtech4good'
      },
      outline: [2, 3],
      nav: [
        { text: 'Get started', link: '/get-started/' },
        { text: 'Architecture', link: '/architecture/' },
        { text: 'Reference', link: '/reference/lessons-and-question-types' },
        { text: 'Contributing', link: '/contributing/' },
        { text: 'About', link: '/about/history' }
      ],
      sidebar: [
        {
          text: 'Get started',
          items: [
            { text: 'Overview', link: '/get-started/' },
            { text: 'Local development', link: '/get-started/local-development' },
            { text: 'Self-hosting', link: '/get-started/self-hosting' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Classroom to cloud sync', link: '/architecture/sync' },
            { text: 'Authorization model', link: '/architecture/authorization' },
            { text: 'Object storage', link: '/architecture/storage' }
          ]
        },
        {
          text: 'Product reference',
          items: [
            { text: 'Lessons and question types', link: '/reference/lessons-and-question-types' },
            { text: 'Disability fields', link: '/reference/disability-fields' },
            { text: 'Khmer text', link: '/reference/khmer-text' },
            { text: 'TalkBack accessibility audit', link: '/reference/accessibility-talkback-audit' }
          ]
        },
        {
          text: 'Contributing',
          items: [
            { text: 'How to contribute', link: '/contributing/' },
            { text: 'Git and pull requests', link: '/contributing/git-and-pull-requests' },
            { text: 'Testing and verification', link: '/contributing/testing' }
          ]
        },
        {
          text: 'About',
          items: [
            { text: 'History', link: '/about/history' }
          ]
        }
      ]
    }
})
