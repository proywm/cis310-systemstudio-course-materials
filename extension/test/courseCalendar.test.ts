import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildFall2026CourseCalendar,
  FALL_2026_ACADEMIC_EVENTS,
  fall2026CourseMeetings
} from '../src/core/courseCalendar';

describe('Fall 2026 CIS 310 calendar', () => {
  it('generates the verified Monday/Wednesday meeting pattern', () => {
    const meetings = fall2026CourseMeetings();
    assert.equal(meetings.length, 27);
    assert.equal(meetings[0]?.isoDate, '2026-08-26');
    assert.equal(meetings.at(-1)?.isoDate, '2026-12-07');
    assert.equal(meetings.filter((meeting) => meeting.day === 'Monday').length, 13);
    assert.equal(meetings.filter((meeting) => meeting.day === 'Wednesday').length, 14);
    assert.ok(!meetings.some((meeting) => ['2026-09-07', '2026-11-23', '2026-11-25'].includes(meeting.isoDate)));
  });

  it('exports the department-confirmed timed meetings and classroom by default', () => {
    const calendar = buildFall2026CourseCalendar();
    assert.match(calendar, /X-WR-CALNAME:CIS 310 Fall 2026/);
    assert.match(calendar, /DTSTART;TZID=America\/Detroit:20260826T100000/);
    assert.match(calendar, /DTEND;TZID=America\/Detroit:20260826T114500/);
    assert.match(calendar, /LOCATION:ELB 1329/);
    assert.match(calendar, /CIS Building\\, Room 230/);
    assert.match(calendar, /Labor Day \\— no CIS 310 class|Labor Day — no CIS 310 class/);
    assert.match(calendar, /8-bit processor implementation and assembly programming/);
    assert.ok(calendar.includes('exact date\\, time\\, room'));
    assert.match(calendar, /to be announced in Canvas/i);
    assert.doesNotMatch(calendar, /Homework \d.+due/i);
    assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 27 + FALL_2026_ACADEMIC_EVENTS.length);
  });

  it('validates explicit timed overrides', () => {
    const calendar = buildFall2026CourseCalendar({ startTime: '13:00', durationMinutes: 60 });
    assert.match(calendar, /BEGIN:VTIMEZONE/);
    assert.match(calendar, /DTSTART;TZID=America\/Detroit:20260826T130000/);
    assert.match(calendar, /DTEND;TZID=America\/Detroit:20260826T140000/);
    assert.throws(() => buildFall2026CourseCalendar({ startTime: '25:00', durationMinutes: 105 }), /valid HH:MM/);
  });
});
