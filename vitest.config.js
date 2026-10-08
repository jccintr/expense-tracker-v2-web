import { defineConfig } from 'vitest/config'

// Config própria dos testes: sem isso o Vitest carrega o vite.config.js inteiro,
// inclusive o plugin do flowbite-react (que mantém um watcher aberto e faz o
// processo demorar ~10s pra encerrar). Os testes são de funções puras (utils).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
