// 聊天室Mock Data

export const INITIAL_DB = {
  myProfile: {
    id: 'u_123456',
    name: '米拉',
    avatar: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&h=200&fit=crop',
    type: 'user',
    status: 'online',
    statusMsg: '今天天氣真好，想帶咪咪去散步！',
    pinned: false,
    msgs: []
  },
  community: [
    {
      id: 'c1',
      name: '貓派大聯盟 (官方)',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Cat',
      type: 'community',
      pinned: true,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '本月罐罐團購開始囉！',
          time: '10:00',
          timestamp: 1736301600000,
          read: true
        }
      ],
      notice: '公告：本月罐罐團購開始囉！'
    },
    {
      id: 'c2',
      name: '台北狗狗散步地圖',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DogMap',
      type: 'community',
      pinned: false,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '大安森林公園今天很多人嗎？',
          time: '11:30',
          timestamp: 1736307000000,
          read: false
        }
      ],
      notice: '歡迎分享台北各處適合遛狗的地方！'
    }
  ],
  match: [
    {
      id: 'm1',
      name: 'Jacky & 豆皮',
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100',
      type: 'match',
      status: 'matching',
      pinned: true,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '嗨！我看你們也喜歡去大安森林公園？',
          time: '10:00',
          timestamp: 1736301600000,
          read: true
        },
        {
          id: 2,
          sender: 'me',
          content: '對呀！豆皮超愛草地的',
          time: '10:05',
          timestamp: 1736301900000,
          read: true
        }
      ]
    },
    {
      id: 'm3',
      name: '阿強 & 歐力',
      avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=100',
      type: 'match',
      status: 'matching',
      pinned: false,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '你好，我們的狗狗品種好像一樣！',
          time: '15:00',
          timestamp: 1736319600000,
          read: false
        }
      ]
    },
    {
      id: 'm2',
      name: 'Sarah & 咪咪',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100',
      type: 'match',
      status: 'friend',
      pinned: false,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '下次一起出來玩！',
          time: '09:00',
          timestamp: 1736298000000,
          read: true
        }
      ]
    },
    {
      id: 'm4',
      name: '小惠 & 芝麻',
      avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=100',
      type: 'match',
      status: 'friend',
      pinned: true,
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '今天天氣很好耶',
          time: '08:30',
          timestamp: 1736296200000,
          read: true
        }
      ]
    }
  ],
  stranger: [
    {
      id: 's1',
      name: '想認識你的小白',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stranger',
      type: 'knock',
      status: 'pending',
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '你好，我覺得你的狗狗很可愛！(來自敲敲門)',
          time: '09:00',
          timestamp: 1736298000000,
          read: false
        }
      ]
    },
    {
      id: 's2',
      name: '隔壁老王',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neighbor',
      type: 'knock',
      status: 'trial',
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '我們可以交流一下飼料嗎？',
          time: '14:00',
          timestamp: 1736316000000,
          read: true
        },
        {
          id: 2,
          sender: 'me',
          content: '好喔，我目前吃紐崔斯',
          time: '14:05',
          timestamp: 1736316300000,
          read: false
        }
      ]
    }
  ],
  event: [
    {
      id: 'e1',
      name: '12/25 聖誕柯基路跑',
      avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=Xmas',
      type: 'event',
      status: 'active',
      pinned: false,
      expiryDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '請問集合地點是在大安森林公園幾號出口？',
          time: '09:00',
          timestamp: 1736298000000,
          read: false
        },
        {
          id: 2,
          sender: 'me',
          content: '好像是 5 號出口喔！',
          time: '09:05',
          timestamp: 1736298300000,
          read: false
        }
      ],
      notice: '重要：請大家記得攜帶狗狗的水壺與便便袋！'
    },
    {
      id: 'e2',
      name: '周末貓咪認養會',
      avatar: 'https://api.dicebear.com/7.x/icons/svg?seed=CatAdopt',
      type: 'event',
      status: 'active',
      pinned: true,
      expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      msgs: [
        {
          id: 1,
          sender: 'them',
          content: '當天會有獸醫義診嗎？',
          time: '12:00',
          timestamp: 1736308800000,
          read: false
        }
      ],
      notice: '認養不棄養，給毛孩一個溫暖的家。'
    }
  ]
}

export const INITIAL_AI_DB = {
  agent: {
    id: 'ai_agent',
    name: '波波 (AI 溝通師)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
    description: '您的專屬寵物行為顧問',
    defaultPrompts: [
      { text: '寵物翻譯機', icon: 'fa-language' },
      { text: '毛孩塔羅運勢', icon: 'fa-wand-magic-sparkles' },
      { text: '萌寵行為解密', icon: 'fa-magnifying-glass-chart' },
      { text: '活動推薦趣', icon: 'fa-map-location-dot' }
    ]
  },
  history: [
    {
      id: 'a1',
      name: '波波 (AI 溝通師)',
      title: '狗狗一直抓耳朵',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
      type: 'ai',
      pinned: true,
      msgs: [
        {
          id: 1,
          sender: 'me',
          content: '我家狗狗最近一直抓耳朵，而且有點紅紅的，是怎麼了嗎？',
          time: '10:00',
          timestamp: 1736265600000,
          read: true
        },
        {
          id: 2,
          sender: 'them',
          content:
            '感應到毛孩可能不太舒服... \n耳朵紅腫且頻繁抓癢可能是「外耳炎」或「耳疥蟲」感染的徵兆。建議您可以先觀察是否有異味或分泌物。\n\n⚠️ 溫馨提醒：我只能提供行為建議，生理問題請務必看獸醫喔！',
          time: '10:00',
          timestamp: 1736265605000,
          read: false
        }
      ],
      prompts: [
        { text: '狗狗一直抓耳朵', icon: 'fa-magnifying-glass-chart' },
        { text: '推薦週末聚會', icon: 'fa-map-location-dot' },
        { text: '貓咪一直盯著牆角', icon: 'fa-wand-magic-sparkles' },
        { text: '幫我找鮮食食譜', icon: 'fa-utensils' }
      ]
    }
  ]
}

export const AI_WELCOME_MESSAGES = {
  寵物翻譯機: '汪！我是翻譯官波波 \n請輸入您想說的話，我會幫您翻譯成毛孩聽得懂的語氣喔！',
  毛孩塔羅運勢: '歡迎來到毛孩塔羅 \n請在心中想著您的毛孩，然後輸入「抽牌」！',
  萌寵行為解密:
    '毛孩的行為總是讓人摸不著頭緒嗎？\n請描述您觀察到的行為（例如：一直在門口轉圈），讓我來為您解密！',
  活動推薦趣: '想帶毛孩出去放電嗎？\n請告訴我您所在的地區（例如：台北大安區），我來推薦好去處！'
}
