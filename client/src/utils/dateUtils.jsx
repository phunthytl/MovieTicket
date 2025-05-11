// utils/dateUtils.js
export function getNext7Days() {
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const isoValue = d.toISOString().split('T')[0];
    const weekday = weekdays[d.getDay()];
    const label = i === 0
      ? `Hôm nay ${day}/${month} (${weekday})`
      : `${day}/${month} (${weekday})`;

    return {
      value: isoValue, // yyyy-mm-dd
      label,
      weekday,
    };
  });
}
