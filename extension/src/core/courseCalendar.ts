export const FALL_2026_TERM = 'Fall 2026';
export const FALL_2026_CANVAS_URL = 'https://canvas.umd.umich.edu/courses/552144';
export const FALL_2026_ACADEMIC_CALENDAR_URL =
  'https://umdearborn.edu/sites/default/files/unmanaged/pdf/registrar/2026-2027-academic-calendar.pdf';
export const FALL_2026_CLASS_START_TIME = '10:00';
export const FALL_2026_CLASS_DURATION_MINUTES = 105;
export const FALL_2026_CLASS_TIME_LABEL = '10:00–11:45 a.m.';
export const FALL_2026_CLASS_LOCATION = 'ELB 1329';
export const FALL_2026_OFFICE_HOURS_LABEL = 'Mondays and Wednesdays, 9:30–10:00 a.m. and 12:00–1:00 p.m.; or by appointment';
export const FALL_2026_OFFICE_LOCATION = 'CIS Building, Room 230';

export interface CourseMeeting {
  number: number;
  isoDate: string;
  day: 'Monday' | 'Wednesday';
  month: 'August' | 'September' | 'October' | 'November' | 'December';
  dayOfMonth: number;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  start: string;
  endExclusive: string;
  kind: 'term' | 'holiday' | 'recess' | 'study' | 'exam' | 'commencement';
  note: string;
}

export interface TimedCalendarOptions {
  startTime?: string;
  durationMinutes?: number;
}

const CLASS_START = '2026-08-26';
const CLASS_END = '2026-12-07';
const NON_MEETING_DATES = new Set(['2026-09-07', '2026-11-23', '2026-11-25']);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export const FALL_2026_ACADEMIC_EVENTS: readonly AcademicCalendarEvent[] = [
  {
    id: 'classes-begin',
    title: 'Fall 2026 classes begin',
    start: '2026-08-26',
    endExclusive: '2026-08-27',
    kind: 'term',
    note: 'CIS 310 meets on the first day of classes.'
  },
  {
    id: 'labor-day',
    title: 'Labor Day — no CIS 310 class',
    start: '2026-09-07',
    endExclusive: '2026-09-08',
    kind: 'holiday',
    note: 'University holiday.'
  },
  {
    id: 'thanksgiving-recess',
    title: 'Thanksgiving recess — no CIS 310 class',
    start: '2026-11-21',
    endExclusive: '2026-11-30',
    kind: 'recess',
    note: 'No Monday or Wednesday meeting during recess; classes resume Monday, November 30.'
  },
  {
    id: 'classes-end',
    title: 'Fall 2026 classes end',
    start: '2026-12-07',
    endExclusive: '2026-12-08',
    kind: 'term',
    note: 'This is the final regular Monday meeting.'
  },
  {
    id: 'study-days',
    title: 'Study days',
    start: '2026-12-08',
    endExclusive: '2026-12-10',
    kind: 'study',
    note: 'Tuesday and Wednesday study days.'
  },
  {
    id: 'exams-first',
    title: 'University examination period',
    start: '2026-12-10',
    endExclusive: '2026-12-12',
    kind: 'exam',
    note: 'First examination block; verify the CIS 310 final-exam slot, time, and room in Canvas.'
  },
  {
    id: 'exams-second',
    title: 'University examination period',
    start: '2026-12-14',
    endExclusive: '2026-12-17',
    kind: 'exam',
    note: 'Second examination block; verify the CIS 310 final-exam slot, time, and room in Canvas.'
  },
  {
    id: 'commencement',
    title: 'Fall commencement',
    start: '2026-12-19',
    endExclusive: '2026-12-20',
    kind: 'commencement',
    note: 'University commencement date.'
  }
];

export function fall2026CourseMeetings(): CourseMeeting[] {
  const start = dateAtNoonUtc(CLASS_START);
  const end = dateAtNoonUtc(CLASS_END);
  const meetings: CourseMeeting[] = [];
  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const weekday = date.getUTCDay();
    const isoDate = formatIsoDate(date);
    if ((weekday !== 1 && weekday !== 3) || NON_MEETING_DATES.has(isoDate)) {
      continue;
    }
    meetings.push({
      number: meetings.length + 1,
      isoDate,
      day: weekday === 1 ? 'Monday' : 'Wednesday',
      month: MONTHS[date.getUTCMonth()] as CourseMeeting['month'],
      dayOfMonth: date.getUTCDate()
    });
  }
  return meetings;
}

export function buildFall2026CourseCalendar(options: TimedCalendarOptions = {}): string {
  const startTime = options.startTime ?? FALL_2026_CLASS_START_TIME;
  const durationMinutes = options.durationMinutes ?? FALL_2026_CLASS_DURATION_MINUTES;
  if (!isValidTime(startTime) || !isValidDuration(durationMinutes)) {
    throw new Error('Timed calendar export requires a valid HH:MM start time and a duration from 1 to 480 minutes.');
  }

  const events = fall2026CourseMeetings().map((meeting) => {
    const description = `Regular Monday/Wednesday CIS 310 meeting, ${FALL_2026_CLASS_TIME_LABEL}, ${FALL_2026_CLASS_LOCATION}. Office hours: ${FALL_2026_OFFICE_HOURS_LABEL}, ${FALL_2026_OFFICE_LOCATION}. Check Fall 2026 Canvas for topic, assignment, or schedule changes.`;
    return calendarEvent(
      `meeting-${String(meeting.number).padStart(2, '0')}`,
      `CIS 310 class meeting ${meeting.number} of 27`,
      description,
      timedEvent(meeting.isoDate, startTime, durationMinutes),
      FALL_2026_CLASS_LOCATION
    );
  });

  const academicEvents = FALL_2026_ACADEMIC_EVENTS.map((event) => calendarEvent(
    event.id,
    event.title,
    `${event.note} Source: official UM-Dearborn 2026–2027 academic calendar.`,
    `DTSTART;VALUE=DATE:${compactDate(event.start)}\r\nDTEND;VALUE=DATE:${compactDate(event.endExclusive)}`
  ));

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SystemStudio CIS 310//Fall 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:CIS 310 Fall 2026',
    ...timeZoneBlock(),
    ...events,
    ...academicEvents,
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}

function calendarEvent(id: string, summary: string, description: string, timing: string, location?: string): string {
  return [
    'BEGIN:VEVENT',
    `UID:cis310-fall2026-${id}@systemstudio`,
    'DTSTAMP:20260819T000000Z',
    timing,
    `SUMMARY:${escapeIcs(summary)}`,
    ...(location ? [`LOCATION:${escapeIcs(location)}`] : []),
    `DESCRIPTION:${escapeIcs(description)}`,
    `URL:${FALL_2026_CANVAS_URL}`,
    'END:VEVENT'
  ].join('\r\n');
}

function timedEvent(isoDate: string, startTime: string, durationMinutes: number): string {
  const [hour, minute] = startTime.split(':').map(Number) as [number, number];
  const start = new Date(`${isoDate}T${startTime}:00Z`);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const date = compactDate(isoDate);
  const endDate = `${end.getUTCFullYear()}${String(end.getUTCMonth() + 1).padStart(2, '0')}${String(end.getUTCDate()).padStart(2, '0')}`;
  return [
    `DTSTART;TZID=America/Detroit:${date}T${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}00`,
    `DTEND;TZID=America/Detroit:${endDate}T${String(end.getUTCHours()).padStart(2, '0')}${String(end.getUTCMinutes()).padStart(2, '0')}00`
  ].join('\r\n');
}

function timeZoneBlock(): string[] {
  return [
    'BEGIN:VTIMEZONE',
    'TZID:America/Detroit',
    'X-LIC-LOCATION:America/Detroit',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];
}

function isValidTime(value: string | undefined): value is string {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDuration(value: number | undefined): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 480;
}

function dateAtNoonUtc(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00Z`);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function compactDate(isoDate: string): string {
  return isoDate.replaceAll('-', '');
}

function escapeIcs(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');
}
