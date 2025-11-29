import { defineConfig } from 'vitepress'

const PUBLIC_URL = process.env.VITE_PUBLIC_URL || ''

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Estimate Corrector 2024",
  description: "WIP",
  base: `${PUBLIC_URL}`,
  outDir: 'output',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/samples/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Task tracking', link: '/samples/markdown-examples' },
          { text: 'Runtime API Examples', link: '/samples/api-examples' }
        ]
      },
      {
        text: 'EN',
        items: [
          { text: 'How to use', link: '/en/doc' }
        ]
      },
      {
        text: 'RU',
        items: [
          { text: 'Как пользоваться', link: '/ru/doc' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'telegram', link: 'https://t.me/bash_exp_ru/607' }
    ]
  }
})
