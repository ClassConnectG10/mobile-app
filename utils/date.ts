export function getRelativeTime(date: Date): {
  relativeTime: string;
  isOverdue: boolean;
  isWarning: boolean;
} {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diff = Math.round(diffMs / 1000); // in seconds

  if (Math.abs(diff) < 60) {
    return { relativeTime: "vence ahora", isOverdue: false, isWarning: true };
  }

  const isOverdue = diff < 0;
  const isWarning = diff >= 0 && diff < 60 * 60 * 24; // less than 1 day

  const units: [string, string, number][] = [
    ["año", "años", 60 * 60 * 24 * 365],
    ["mes", "meses", 60 * 60 * 24 * 30],
    ["día", "días", 60 * 60 * 24],
    ["hora", "horas", 60 * 60],
    ["minuto", "minutos", 60],
  ];

  for (const [unit, plural_unit, seconds] of units) {
    const amount = Math.floor(Math.abs(diff) / seconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit : plural_unit;
      const text =
        diff > 0
          ? `vence en ${amount} ${label}`
          : `vencido hace ${amount} ${label}`;
      return { relativeTime: text, isOverdue, isWarning };
    }
  }

  return { relativeTime: "vence ahora", isOverdue, isWarning };
}
