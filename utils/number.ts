interface NumberUnit {
  value: number;
  singular: string;
  plural: string;
}

const NUMBER_UNIT_THOUSAND: NumberUnit = {
  value: 1000,
  singular: "K",
  plural: "K",
};

const NUMBER_UNIT_MILLION: NumberUnit = {
  value: 1000000,
  singular: "M",
  plural: "M",
};

const numberUnits: NumberUnit[] = [NUMBER_UNIT_MILLION, NUMBER_UNIT_THOUSAND];

export function formatNumberToString(value: number): string {
  for (const unit of numberUnits) {
    if (value >= unit.value) {
      const formattedValue = (value / unit.value).toFixed(2);
      return `${formattedValue}${unit.singular}`;
    }
  }
  return value.toString();
}
