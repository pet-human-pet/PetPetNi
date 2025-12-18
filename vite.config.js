// 從Node.js的node:url拿出URL(用來處理網址或路徑物件的工具）；fileURLToPath是個把「網址格式路徑」（如 file:///C:/Users/Project/src）轉成電腦看得懂的「檔案系統路徑」（例如 C:\Users\Project\src）轉換器。
// 因Vite在Node.js環境運作，且是用ES Modules模組系統的檔案位置通常是用URL表示，不能直接用舊的方法（如 __dirname）來抓取路徑，所以用該法處理檔案路徑。
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    vueDevTools(),
    tailwindcss(),
    // PWA是讓網頁變身App的轉換器，以下啟用並設定其細節
    VitePWA({
      registerType: 'autoUpdate', // 發布新版本時讓瀏覽器自動更新，不卡在舊版
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: { // manifest是App的「身分證」
        name: '我的專案名稱', // 安裝在手機桌面上要顯示什麼名字
        short_name: '專案簡稱',
        description: '一個專屬於寵物的社群平台',
        theme_color: '#ffffff', // App的主題顏色
        icons: [ // 告訴手機不同解析度下要用哪張圖當App圖示
          {
            src: 'pwa-192x192.png', // 之後記得在 public 資料夾放這些圖
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // 告訴Vite看到@時，自動替換成src資料夾的絕對路徑。如@/components/Header.vue
  resolve: { // 解析；是Vite設定檔中的一個區塊，用來設定如何尋找檔案。可在這告訴Vite各種尋找檔案的規則。
    alias: { // 別名;是resolve底下的一個清單，用來設定路徑的綽號。key(綽號)對應到value(真實路徑)。fileURLToPath(...)把找到的結果轉成電腦看得懂的路徑字串；new URL('./src', ...)以vite.config.js為起點，找到./src資料夾。import.meta.url: 是現在這個檔案 (vite.config.js)」的位置。
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})


