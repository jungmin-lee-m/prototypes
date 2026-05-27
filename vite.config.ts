import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Each prototype is a self-contained top-level folder with its own index.html.
// Register a prototype here to include it in the build and on the landing page.
const prototypes = {
  emr: 'emr/index.html',
  'uisarang-ai': 'uisarang-ai/index.html',
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/prototypes/' : '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          Object.entries(prototypes).map(([name, html]) => [
            name,
            path.resolve(__dirname, html),
          ]),
        ),
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
