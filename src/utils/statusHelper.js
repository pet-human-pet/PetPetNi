/**
 * 取得活動/團購狀態的 Badge 設定
 * @param {string} status - 狀態字串 (e.g. 'recruiting', 'ongoing', 'ended', 'pending')
 * @returns {{ text: string, cls: string }}
 */
export function getStatusBadge(status) {
  const s = String(status || '').toLowerCase()

  // 報名中 / 開放中
  if (['recruiting', 'signup', 'open'].includes(s)) {
    return { text: '報名中', cls: 'bg-green-50 text-green-700' }
  }

  // 進行中 / 活躍中
  if (['ongoing', 'active', 'in_progress', 'approved'].includes(s)) {
    return { text: '進行中', cls: 'bg-blue-50 text-blue-500' }
  }

  // 已結束 / 關閉
  if (['ended', 'closed'].includes(s)) {
    return { text: '已結束', cls: 'bg-gray-100 text-fg-muted' }
  }

  // 審核中
  if (['pending', 'reviewing'].includes(s)) {
    return { text: '審核中', cls: 'bg-orange-50 text-orange-600' }
  }

  // 預設 (未知狀態)
  return { text: '未知', cls: 'bg-gray-100 text-fg-muted' }
}
