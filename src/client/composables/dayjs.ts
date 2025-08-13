import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/locale/vi'

dayjs.locale('vi')
dayjs.extend(relativeTime)
dayjs.extend(isoWeek)

export const useDayJs = () => {
  const fromTime = (start : Date, end? : Date, noSuffix : boolean = false) : string => {
    const startDayJS = dayjs(start)
    const endDayJS = dayjs(end || new Date())
    return startDayJS.from(endDayJS, noSuffix) as string
  }

  const displayDay = (time : Date) : string => {
    const t = dayjs(time)
    return t.format('DD [Th]MM YYYY')
  }

  const displayTime = (time : Date) : string => {
    const t = dayjs(time)
    return t.format('HH:mm')
  }

  const displayFull = (time : Date) : string => {
    const t = dayjs(time)
    return t.format('DD [Th]MM YYYY [lúc] HH:mm')
  }

  return { dayjs, fromTime, displayDay, displayTime, displayFull }
}