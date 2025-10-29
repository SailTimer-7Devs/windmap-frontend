import { toZonedTime, format } from 'date-fns-tz'

export function formatDateToLocalISOString(dateIso: string): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const zonedDate = toZonedTime(dateIso, timeZone)
  return format(zonedDate, 'yyyy/MM/dd HH:mm', { timeZone })
}
