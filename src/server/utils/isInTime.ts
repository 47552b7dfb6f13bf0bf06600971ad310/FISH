

export default (startStr : string, endStr : string = '') : boolean => {
  function toMinutes(hhmm : any) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const start = toMinutes(startStr);
  const end = toMinutes(endStr);

  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  } 
  else {
    return nowMinutes >= start || nowMinutes < end;
  }
} 