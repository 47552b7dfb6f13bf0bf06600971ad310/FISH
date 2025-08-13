import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import isoWeek  from 'dayjs/plugin/isoWeek.js'

declare global {
  var DayJS : any
}

export default defineNitroPlugin(async () => {
  dayjs.extend(weekOfYear)
  dayjs.extend(isoWeek)
  global.DayJS = dayjs
})
