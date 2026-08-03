import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json'
import slugify from 'slugify'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { VitePWA } from 'vite-plugin-pwa'
import markdownItAnchor from 'markdown-it-anchor'

const defaultNodeEnv = 'production'
process.env = {
  ...process.env,
  ...loadEnv(process.env.NODE_ENV || defaultNodeEnv, process.cwd()),
}
const isDev = process.env.NODE_ENV === 'development'
const PUBLIC_URL = process.env.VITE_PUBLIC_URL || ''
const GIT_SHA1 = process.env.VITE_GIT_SHA1
const BRAND_NAME = process.env.VITE_BRAND_NAME || '[NN]'

slugify.extend({ '/': '_' })

function* Counter(initValue: number = 0) {
  let count = initValue
  while (true) yield count++
}
const chuncksCounter = Counter(0)
const modulesToSeparate = [
  // 'axios',
  // 'retry-axios',
  '@mui/material',
  // '@remix-run',
  'react-dom',
  'dayjs',
  'react-google-charts',
  'react-hook-form',
  'recharts',
  'brain.js',
  'javascript-time-ago',
  'json-edit-react',
  'ts-tree-lib',
  'react-photo-view',
]
const _chunksMap = new Map()

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      workbox: {
        sourcemap: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 ** 2, // NOTE: 10 MB or set to something else
        // NOTE: Указываем Workbox сканировать папку public (или dist во время сборки)
        globDirectory: 'dist',
        globPatterns: [
          // NOTE: Кэшируем файлы сборки (js, css, html и т.д.)
          '**/*.{js,css,html,ico,png,svg,webmanifest}',
          // NOTE: Принудительно включаем абсолютно всю статику воркеров в оффлайн-кэш
          'static/workers/**/*.{js,json}'
        ],
        // NOTE: Игнорируем query-параметры (?v=...), чтобы Workbox корректно находил файлы в кэше
        ignoreURLParametersMatching: [/^v$/, /^ts$/],

        runtimeCaching: [
          {
            // Перехватываем все файлы, заканчивающиеся на .mp3
            urlPattern: /.*\.mp3/,
            // Используем стратегию "Сначала кэш, если нет - сеть"
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // Хранить 30 дней
              },
              cacheableResponse: {
                // Кэшируем только успешные ответы (0 для непрозрачных CORS-запросов)
                statuses: [0, 200],
                // - 200 (OK) — стандартный успешный ответ от вашего сервера,
                // когда файл найден и успешно отдается целиком.
                // - 0 (Opaque/Непрозрачный статус) — критически важен,
                // если ваши аудиофайлы загружаются со стороннего сервера или CDN (например, с другого домена или поддомена).
                // Браузер из соображений безопасности скрывает точный статус ответа (делает его 0),
                // если на сервере не настроены специфические CORS-заголовки.
                // Если не указать 0, файлы с внешних ресурсов просто не будут кэшироваться.
              },
              plugins: [
                // КРИТИЧЕСКИ ВАЖНО: Этот плагин позволяет Workbox отвечать на Range-запросы из кэша
                {
                  cachedResponseWillBeUsed: async ({ cachedResponse }) => {
                    if (cachedResponse) {
                      return cachedResponse;
                    }
                    return null;
                  },
                },
                // Поддержка заголовков Range (запросы partial content)
                // Примечание: Workbox автоматически добавит RangeRequestsPlugin под капотом, 
                // если плагин видит работу с медиа, но для надежности мы изолируем кэш через cacheName.
              ],
            },
          },
        ],
      },
      registerType: 'autoUpdate',
      minify: false,
      mode: isDev ? 'development' : 'production',
      srcDir: 'public/static/pwa/', // NOTE: Default 'public'
      outDir: 'dist',
      filename: 'sw.js',
      manifestFilename: 'site.webmanifest', // NOTE: Default 'manifest.webmanifest'
      strategies: 'generateSW',
      injectRegister: 'auto',
      manifest: {
        theme_color: '#1565C0',
        background_color: '#1565C0',
        name: BRAND_NAME,
        short_name: BRAND_NAME,
        start_url: `${PUBLIC_URL}/#/?source=pwa&debug=1`,
        scope: `${PUBLIC_URL}/`,
        // scope: './',
        icons: [
          {
            src: `${PUBLIC_URL}/static/pwa/pwa-64x64.png`,
            sizes: '64x64',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '192x192',
            src: `${PUBLIC_URL}/static/pwa/pwa-192x192.png`,
            type: 'image/png',
          },
          {
            src: `${PUBLIC_URL}/static/pwa/pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: `${PUBLIC_URL}/static/pwa/maskable-icon-512x512.png`,
            type: 'image/png',
          },
        ],
        orientation: 'any',
        display: 'standalone',
        // display_override: ["fullscreen", "minimal-ui"],
        // dir: 'auto',
        lang: 'ru-RU',
      },
      useCredentials: true,
      includeManifestIcons: true,
      disable: isDev,
    }),

    // NOTE: Last one
    // See also https://www.npmjs.com/package/rollup-plugin-visualizer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    visualizer({
      title: `Stats | Estimate Corrector v${pkg.version} | GIT SHA1 ${GIT_SHA1}`,
      template: 'sunburst', // sunburst, treemap, network
      emitFile: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
    extensions: [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ],
  },
  build: {
    // NOTE: See also https://github.com/marcofugaro/browserslist-to-esbuild/blob/main/test/test.js
    target: browserslistToEsbuild(),
    outDir: 'dist',
    rollupOptions: {
      output: {

        manualChunks(id: string, _manualChunkMeta) {
          for (const moduleSubstr of modulesToSeparate) {
            // NOTE: Reducing the vendor chunk size
            // See also https://dev.to/tassiofront/splitting-vendor-chunk-with-vite-and-loading-them-async-15o3
            if (id.includes(moduleSubstr)) {
              const normalizedModuleSubstr = slugify(moduleSubstr)
              const fromMap = _chunksMap.get(normalizedModuleSubstr)
              if (!fromMap) {
                const chunkName = `chunk.${chuncksCounter.next().value}.${normalizedModuleSubstr}`
                _chunksMap.set(normalizedModuleSubstr, chunkName)
                return chunkName
              } else return _chunksMap.get(normalizedModuleSubstr)
            }
          }
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  markdown: {
    // options for markdown-it-anchor
    // https://github.com/valeriangalliat/markdown-it-anchor#usage
    anchor: {
      permalink: markdownItAnchor.permalink.headerLink()
    },

    // options for @mdit-vue/plugin-toc
    // https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc#options
    toc: { level: [1, 2] },

    // config: (md) => {
    //   // use more markdown-it plugins!
    //   md.use(markdownItFoo)
    // }
  }
})
