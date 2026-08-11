export interface ParsedFHIRDateTime {
  date: string;
  time: string;
  offset: string;
}

export function isFHIRDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function parseFHIRDate(value?: string): Date | undefined {
  if (!value || !isFHIRDate(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatFHIRDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseFHIRDateTime(
  value?: string,
  defaultOffset = "+07:00",
): ParsedFHIRDateTime {
  if (!value) return { date: "", time: "", offset: defaultOffset };

  if (isFHIRDate(value)) return { date: value, time: "", offset: defaultOffset };

  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !isFHIRDate(match[1])) {
    return { date: "", time: "", offset: defaultOffset };
  }

  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = match[4] === undefined ? 0 : Number(match[4]);
  if (hour > 23 || minute > 59 || second > 59) {
    return { date: "", time: "", offset: defaultOffset };
  }

  return { date: match[1], time: `${match[2]}:${match[3]}`, offset: match[5] };
}

export function formatFHIRDateTime(value: ParsedFHIRDateTime): string {
  if (!value.date || !isFHIRDate(value.date)) return "";
  if (!value.time) return value.date;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)) return "";
  if (!/^(Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/.test(value.offset)) return "";
  return `${value.date}T${value.time}:00${value.offset}`;
}
