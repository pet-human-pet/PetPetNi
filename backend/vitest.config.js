import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 測試環境：Node.js（後端 API 測試）
    environment: 'node',

    // 測試檔案位置
    include: ['__tests__/**/*.test.js'],

    // 排除的檔案
    exclude: ['node_modules', 'dist'],

    // 全域變數（describe, it, expect 等）
    globals: true,

    // 覆蓋率設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/index.js', '__tests__/**']
    },

    // 測試逾時時間（毫秒）
    testTimeout: 10000,

    // 顯示詳細資訊
    silent: false
  }
})
