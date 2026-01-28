import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.d.ts'],
  },


  js.configs.recommended,


  ...pluginVue.configs['flat/recommended'],


  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },


  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 團隊共識規則 
      'vue/multi-word-component-names': 'off', // 關閉元件名稱雙字限制
      'vue/require-v-for-key': 'error',        // v-for 一定要 key
      'no-unused-vars': 'warn',                // 沒用到的變數給警告
      'no-var': 'error',                       // 禁止使用 var
      'no-console': 'warn',                    // console.log 給警告
    },
  },

  // 【關鍵】載入 Prettier 設定 (一定要放最後！)
  // 這會關閉所有跟排版衝突的 ESLint 規則
  eslintConfigPrettier,
]