/**
 * iCalendar (.ics) Generator compliant with RFC 5545
 * Generates calendar events for multi-city trips and activities
 */

interface TripForIcs {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  stops?: Array<{
    id: number;
    city_name: string;
    country: string;
    start_date: string;
    end_date: string;
    activities?: Array<{
      id: number;
      name: string;
      category?: string;
      cost?: number;
      scheduled_time?: string;
      day_number?: number;
      notes?: string;
    }>;
  }>;
}

function formatDateToIcs(dateStr: string, timeStr?: string): string {
  try {
    const cleanDate = dateStr.split('T')[0].replace(/-/g, '');
    if (!timeStr || timeStr === 'Flexible') {
      return `${cleanDate}T090000Z`;
    }

    // Parse simple time string like "10:00 AM" or "18:30"
    let hours = 9;
    let minutes = 0;

    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${cleanDate}T${hh}${mm}00Z`;
  } catch {
    return `${dateStr.replace(/[^0-9]/g, '').slice(0, 8)}T090000Z`;
  }
}

function formatEndIcs(startIcs: string, durationHours: number = 2): string {
  try {
    const datePart = startIcs.slice(0, 8);
    const timePart = startIcs.slice(9, 13);
    let hh = parseInt(timePart.slice(0, 2), 10) + durationHours;
    const mm = timePart.slice(2, 4);
    if (hh >= 24) hh = 23;
    return `${datePart}T${String(hh).padStart(2, '0')}${mm}00Z`;
  } catch {
    return startIcs;
  }
}

export function generateTripIcs(trip: TripForIcs): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlobeTrotter//Trip Departure Pack//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${trip.name.replace(/[,;]/g, ' ')}`,
    'X-WR-TIMEZONE:UTC',
  ];

  // 1. Add Main Trip Overall Event
  const tripStartIcs = formatDateToIcs(trip.start_date);
  const tripEndIcs = formatDateToIcs(trip.end_date, '18:00');

  lines.push(
    'BEGIN:VEVENT',
    `UID:trip-${trip.id}@globetrotter.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${tripStartIcs}`,
    `DTEND:${tripEndIcs}`,
    `SUMMARY:✈️ Journey: ${trip.name.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${(trip.description || 'Multi-city travel journey on GlobeTrotter').replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Trip starts tomorrow: ${trip.name}`,
    'END:VALARM',
    'END:VEVENT'
  );

  // 2. Add Stop & Activity Specific Events
  if (trip.stops && Array.isArray(trip.stops)) {
    trip.stops.forEach((stop, stopIdx) => {
      const stopStartIcs = formatDateToIcs(stop.start_date, '08:00');
      const stopEndIcs = formatDateToIcs(stop.end_date, '20:00');

      lines.push(
        'BEGIN:VEVENT',
        `UID:stop-${stop.id || stopIdx}-${trip.id}@globetrotter.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${stopStartIcs}`,
        `DTEND:${stopEndIcs}`,
        `SUMMARY:📍 Stop: ${stop.city_name} (${stop.country})`,
        `LOCATION:${stop.city_name}, ${stop.country}`,
        `DESCRIPTION:City stop in ${stop.city_name} from ${stop.start_date} to ${stop.end_date}.`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );

      // Add individual activities if scheduled
      if (stop.activities && Array.isArray(stop.activities)) {
        stop.activities.forEach((act, actIdx) => {
          const actDate = stop.start_date; // Default to stop date
          const actStartIcs = formatDateToIcs(actDate, act.scheduled_time || '10:00 AM');
          const actEndIcs = formatEndIcs(actStartIcs, 2);

          lines.push(
            'BEGIN:VEVENT',
            `UID:act-${act.id || actIdx}-${stop.id || stopIdx}@globetrotter.com`,
            `DTSTAMP:${now}`,
            `DTSTART:${actStartIcs}`,
            `DTEND:${actEndIcs}`,
            `SUMMARY:🎯 ${act.name.replace(/[,;]/g, ' ')}`,
            `LOCATION:${stop.city_name}, ${stop.country}`,
            `DESCRIPTION:${(act.notes || `${act.category || 'Experience'} in ${stop.city_name}`).replace(/\n/g, '\\n')}${act.cost ? `\\nEstimated Cost: $${act.cost}` : ''}`,
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            `DESCRIPTION:Upcoming activity: ${act.name} in ${stop.city_name}`,
            'END:VALARM',
            'END:VEVENT'
          );
        });
      }
    });
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
