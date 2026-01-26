import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const matchApi = {
  // 每日配對
  performDailyMatch: () => {
    const token = localStorage.getItem('token')
    return axios.post(
      `${API_URL}/match/daily`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  }
}

export default matchApi
