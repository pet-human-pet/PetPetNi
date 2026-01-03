import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'

dayjs.extend(relativeTime)
dayjs.locale('zh-tw')

export function formatCommentTime(time) {
  const now = dayjs()
  const target = dayjs(time)

  const diffDays = now.diff(target, 'day')

  if (diffDays >= 7) {
    return target.format('YYYY/MM/DD')
  }

  return target.fromNow()
}
