export function getDateDiffInfo(targetDate: Date, baseDate = new Date()) {
  const diffMs = targetDate.getTime() - baseDate.getTime();
  const diffInSeconds = Math.round(diffMs / 1000);

  const isOverdue = diffInSeconds < 0;
  const isWarning = diffInSeconds >= 0 && diffInSeconds < 60 * 60 * 24;

  return { diffInSeconds, isOverdue, isWarning };
}

const units: [string, string, number][] = [
  ["año", "años", 60 * 60 * 24 * 365],
  ["mes", "meses", 60 * 60 * 24 * 30],
  ["día", "días", 60 * 60 * 24],
  ["hora", "horas", 60 * 60],
  ["minuto", "minutos", 60],
];

export function formatDateTime(date: Date): string {
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function getRelativeTimeFromNow(date: Date): {
  relativeTime: string;
  isOverdue: boolean;
  isWarning: boolean;
} {
  const { diffInSeconds, isOverdue, isWarning } = getDateDiffInfo(date);

  if (Math.abs(diffInSeconds) < 60) {
    return { relativeTime: "vence ahora", isOverdue, isWarning };
  }

  for (const [unit, plural_unit, unit_in_seconds] of units) {
    const amount = Math.floor(Math.abs(diffInSeconds) / unit_in_seconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit : plural_unit;
      const text =
        diffInSeconds > 0
          ? `vence en ${amount} ${label}`
          : `vencido hace ${amount} ${label}`;
      return { relativeTime: text, isOverdue, isWarning };
    }
  }

  return { relativeTime: "vence ahora", isOverdue, isWarning };
}

export function getRelativeTimeFromDue(
  dueDate: Date,
  submissionDate: Date,
): {
  relativeTime: string;
  isOverdue: boolean;
} {
  const { diffInSeconds, isOverdue } = getDateDiffInfo(dueDate, submissionDate);

  if (Math.abs(diffInSeconds) < 60) {
    return {
      relativeTime: "entregada justo a tiempo",
      isOverdue,
    };
  }

  for (const [unit, plural_unit, unit_in_seconds] of units) {
    const amount = Math.floor(Math.abs(diffInSeconds) / unit_in_seconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit : plural_unit;
      const timeText = `${amount} ${label}`;

      const relativeTime =
        diffInSeconds < 0
          ? `entregada con ${timeText} de retraso`
          : `entregada con ${timeText} de anticipación`;

      return { relativeTime, isOverdue };
    }
  }

  return {
    relativeTime: "entregada ahora",
    isOverdue,
  };
}

export function getDateFromBackend(dateString: string): Date {
  const date = new Date(dateString + "Z");
  return date;
}
