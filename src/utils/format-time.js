import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function convertMillisToTime(millis) {
  let hours = Math.floor(millis / 3600000); // 1 Hour = 36000 Milliseconds
  let minutes = Math.floor((millis % 3600000) / 60000); // 1 Minutes = 60000 Milliseconds

  return `${hours} Hrs ${minutes} Mins`;
}

export function timeCalc(end, start) {
  return (
    (Math.floor(new Date(end).getTime() / 1000) - Math.floor(new Date(start).getTime() / 1000)) *
    1000
  );
}
