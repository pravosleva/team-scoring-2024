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
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
