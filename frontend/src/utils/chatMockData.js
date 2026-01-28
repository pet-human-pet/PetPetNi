// 聊天室初始資料結構
// 現在使用 Supabase 真實資料,這裡只保留空結構

export const INITIAL_DB = {
  myProfile: {
    id: null,
    name: '',
    avatar: '',
    type: 'user',
    status: 'offline',
    statusMsg: '',
    pinned: false,
    msgs: []
  },
  match: [],
  event: []
}

export const INITIAL_AI_DB = {
  agent: {
    id: 'ai_agent',
    name: '波波 (AI 溝通師)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
    description: '您的專屬寵物行為顧問',
    defaultPrompts: [
      { text: '寵物翻譯機', icon: 'fa-language' },
      { text: '萌寵行為解密', icon: 'fa-magnifying-glass-chart' }
    ]
  },
  history: []
}

export const AI_WELCOME_MESSAGES = {
  寵物翻譯機: '汪！我是翻譯官波波 \n請輸入您想說的話，我會幫您翻譯成毛孩聽得懂的語氣喔！',
  毛孩塔羅運勢: '歡迎來到毛孩塔羅 \n請在心中想著您的毛孩，然後輸入「抽牌」！',
  萌寵行為解密:
    '毛孩的行為總是讓人摸不著頭緒嗎？\n請描述您觀察到的行為（例如：一直在門口轉圈），讓我來為您解密！',
  活動推薦趣: '想帶毛孩出去放電嗎？\n請告訴我您所在的地區（例如：台北大安區），我來推薦好去處！'
}
