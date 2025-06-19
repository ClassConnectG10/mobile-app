// Estructura para unidades relativas
interface RelativeUnit {
  valueInSeconds: number;
  singular: string;
  plural: string;
  shortSingular: string;
  shortPlural: string;
}

const RELATIVE_UNIT_YEAR: RelativeUnit = {
  valueInSeconds: 60 * 60 * 24 * 365,
  singular: "año",
  plural: "años",
  shortSingular: "año",
  shortPlural: "años",
};
const RELATIVE_UNIT_MONTH: RelativeUnit = {
  valueInSeconds: 60 * 60 * 24 * 30,
  singular: "mes",
  plural: "meses",
  shortSingular: "mes",
  shortPlural: "meses",
};
const RELATIVE_UNIT_DAY: RelativeUnit = {
  valueInSeconds: 60 * 60 * 24,
  singular: "día",
  plural: "días",
  shortSingular: "días",
  shortPlural: "días",
};
const RELATIVE_UNIT_HOUR: RelativeUnit = {
  valueInSeconds: 60 * 60,
  singular: "hora",
  plural: "horas",
  shortSingular: "hs",
  shortPlural: "hs",
};
const RELATIVE_UNIT_MINUTE: RelativeUnit = {
  valueInSeconds: 60,
  singular: "minuto",
  plural: "minutos",
  shortSingular: "min",
  shortPlural: "mins",
};

const relativeUnits: RelativeUnit[] = [
  RELATIVE_UNIT_YEAR,
  RELATIVE_UNIT_MONTH,
  RELATIVE_UNIT_DAY,
  RELATIVE_UNIT_HOUR,
  RELATIVE_UNIT_MINUTE,
];

export function getSimpleRelativeTimeFromNow(date: Date): string {
  const { diffInSeconds } = getDateDiffInfo(date);
  for (const unit of relativeUnits) {
    const amount = Math.floor(Math.abs(diffInSeconds) / unit.valueInSeconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit.shortSingular : unit.shortPlural;
      return `${amount} ${label}`;
    }
  }
  // Si es menos de un minuto, devolver "0 min"
  return "0 min";
}
export function getDateDiffInfo(targetDate: Date, baseDate = new Date()) {
  const diffMs = targetDate.getTime() - baseDate.getTime();
  const diffInSeconds = Math.round(diffMs / 1000);

  const isOverdue = diffInSeconds < 0;
  const isWarning = diffInSeconds >= 0 && diffInSeconds < 60 * 60 * 24;

  return { diffInSeconds, isOverdue, isWarning };
}

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

export function formatLocalDateTime(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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

  for (const unit of relativeUnits) {
    const amount = Math.floor(Math.abs(diffInSeconds) / unit.valueInSeconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit.singular : unit.plural;
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
  submissionDate: Date
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

  for (const unit of relativeUnits) {
    const amount = Math.floor(Math.abs(diffInSeconds) / unit.valueInSeconds);
    if (amount >= 1) {
      const label = amount === 1 ? unit.singular : unit.plural;
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
