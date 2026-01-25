import api from './index'

export const profileApi = {
  /**
   * 建立用戶完整 Profile
   * @param {Object} data - Profile 資料
   * @param {string} data.realName - 真實姓名
   * @param {string} data.nickName - 暱稱
   * @param {string} data.phone - 手機號碼
   * @param {string} data.city - 縣市
   * @param {string} data.district - 行政區
   * @param {Object} data.pet - 寵物資料
   * @param {string} data.pet.name - 寵物名稱
   * @param {string} data.pet.type - 寵物種類 (dog/cat/other)
   * @param {string} data.pet.breed - 品種
   * @param {string} data.pet.birthday - 生日
   * @param {string} data.pet.gender - 性別 (male/female)
   * @param {string[]} data.optionalTags - 標籤陣列
   * @returns {Promise}
   */
  createProfile(data) {
    return api.post('/api/user/profile', data)
  },

  /**
   * 取得個人完整 Profile (含寵物與標籤)
   * @returns {Promise}
   */
  getProfile() {
    return api.get('/api/user/profile')
  }
}

export default profileApi
