import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'

declare global {
  var DayJS : any
}

export default defineNitroPlugin(async () => {
  dayjs.extend(weekOfYear)
  global.DayJS = dayjs
})
