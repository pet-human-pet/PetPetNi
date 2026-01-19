import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import {
  profile as initialProfile,
  otherProfile as initialOtherProfile,
  followingList as initialFollowingList
} from '@/utils/profileData.js'

export const useProfileStore = defineStore('profile', () => {
  // 1. 初始化從 LocalStorage 讀取 (解決 Store 重啟重設問題)
  const savedFollowState = localStorage.getItem('follow_status_2') === 'true'

  const state = reactive({
    profiles: {
      1: {
        ...initialProfile,
        id: '1',
        followingCount: initialProfile.followingCount + (savedFollowState ? 1 : 0)
      },
      2: {
        ...initialOtherProfile,
        id: '2',
        isFollowed: savedFollowState,
        followersCount: initialOtherProfile.followersCount + (savedFollowState ? 1 : 0)
      }
    },
    myFollowingList: [
      ...initialFollowingList.map((u) => ({ ...u, id: String(u.id) })),
      ...(savedFollowState
        ? [
            {
              id: '2',
              name: initialOtherProfile.name,
              avatar: initialOtherProfile.avatar,
              breed: initialOtherProfile.petInfo?.breed || '未知品種'
            }
          ]
        : [])
    ]
  })

  // 快捷訪問
  const myProfile = computed(() => state.profiles['1'])
  const myFollowingList = computed(() => state.myFollowingList)

  const getProfileById = (id) => {
    const sId = id ? String(id) : '1'
    const p = state.profiles[sId] || state.profiles['1']
    return p
  }

  // 追蹤邏輯 (增加硬跳轉持久化)
  const toggleFollow = (targetId) => {
    const tId = String(targetId)
    if (tId === '2') {
      const target = state.profiles['2']
      const me = state.profiles['1']

      target.isFollowed = !target.isFollowed
      const isNowFollowed = target.isFollowed

      // 同步數字
      target.followersCount += isNowFollowed ? 1 : -1
      me.followingCount += isNowFollowed ? 1 : -1

      // 持久化到磁碟
      localStorage.setItem('follow_status_2', isNowFollowed)

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
  }

  return {
    state,
    myProfile,
    myFollowingList,
    getProfileById,
    toggleFollow
  }
})
