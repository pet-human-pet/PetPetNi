import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.join(__dirname, 'chat_history.json')

// 初始化 DB 檔案
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2))
}

// 讀取所有資料
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading DB:', error)
    return {}
  }
}

// 寫入資料
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing DB:', error)
  }
}

export const db = {
  // 取得某個房間的歷史訊息
  getMessages: (roomId) => {
    const data = readDb()
    return data[roomId] || []
  },

  // 儲存訊息到房間
  saveMessage: (roomId, message) => {
    const data = readDb()
    if (!data[roomId]) {
      data[roomId] = []
    }

    // 確保訊息有 timestamp
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    }

    data[roomId].push(newMessage)
    writeDb(data)
    return newMessage
  }
}
