import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import {
  profile as initialProfile,
  otherProfile as initialOtherProfile,
  followingList as initialFollowingList
} from '@/utils/profileData.js'

export const useProfileStore = defineStore('profile', () => {
  // 1. 初始化從 LocalStorage 讀取 (解決 Store 重啟重設問題)
  // 1. 初始化從 LocalStorage 讀取 (支援所有使用者的動態追蹤狀態)
  const getInitialFollowState = (id) => localStorage.getItem(`follow_status_${id}`) === 'true'

  const state = reactive({
    profiles: {
      1: {
        ...initialProfile,
        id: '1',
        // 計算總追蹤數 (模擬動態加總)
        followingCount: initialProfile.followingCount
      },
      2: {
        ...initialOtherProfile,
        id: '2',
        isFollowed: getInitialFollowState('2'),
        followersCount: initialOtherProfile.followersCount + (getInitialFollowState('2') ? 1 : 0)
      }
    },
    myFollowingList: [...initialFollowingList.map((u) => ({ ...u, id: String(u.id) }))]
  })

  // 1.1 根據初始追蹤狀態補足名單與計數 (支援通用化)
  Object.keys(state.profiles).forEach((id) => {
    if (id === '1') return
    const isFollowed = getInitialFollowState(id)
    if (isFollowed) {
      if (!state.myFollowingList.some((u) => u.id === id)) {
        const p = state.profiles[id]
        state.myFollowingList.push({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          breed: p.petInfo?.breed || '未知品種'
        })
      }
      // 確保我的追蹤數正確
      state.profiles['1'].followingCount++
    }
  })

  // 快捷訪問
  const myProfile = computed(() => state.profiles['1'])
  const myFollowingList = computed(() => state.myFollowingList)

  const getProfileById = (id) => {
    const sId = id ? String(id) : '1'
    const p = state.profiles[sId] || state.profiles['1']
    return p
  }

  /**
   * 通用追蹤邏輯
   * @param {string|number} targetId - 目標使用者 ID
   */
  const toggleFollow = (targetId) => {
    const tId = String(targetId)
    const target = state.profiles[tId]
    const me = state.profiles['1']

    if (!target || tId === '1') return

    target.isFollowed = !target.isFollowed
    const isNowFollowed = target.isFollowed

    // 同步數字
    target.followersCount += isNowFollowed ? 1 : -1
    me.followingCount += isNowFollowed ? 1 : -1

    // 持久化到磁碟 (動態鍵值)
    localStorage.setItem(`follow_status_${tId}`, isNowFollowed)

    // 同步名單
    if (isNowFollowed) {
      if (!state.myFollowingList.some((user) => user.id === tId)) {
        state.myFollowingList.push({
          id: target.id,
          name: target.name,
          avatar: target.avatar,
          breed: target.petInfo?.breed || '未知品種'
        })
      }
    } else {
      state.myFollowingList = state.myFollowingList.filter((user) => user.id !== tId)
    }
  }

  return {
    state,
    myProfile,
    myFollowingList,
    getProfileById,
    toggleFollow
  }
})
