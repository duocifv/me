export function isDeviceRunning(
  times: { start: string; end: string }[]
): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const instantRunTolerance = 2; // 2 phút cho mốc start=end

  return times.some(({ start, end }) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes === endMinutes) {
      // Mốc thời gian tức thời: cho phép chạy trong khoảng tolerance phút
      return (
        currentMinutes >= startMinutes &&
        currentMinutes <= startMinutes + instantRunTolerance
      );
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });
}

export function isTimeSlotRunning(time: {
  start: string;
  end: string;
}): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const instantRunTolerance = 2; // cho mốc start = end

  const [startH, startM] = time.start.split(":").map(Number);
  const [endH, endM] = time.end.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes === endMinutes) {
    return (
      currentMinutes >= startMinutes &&
      currentMinutes <= startMinutes + instantRunTolerance
    );
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
