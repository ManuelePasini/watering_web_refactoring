import {DateTime} from "luxon";

export const luxonDateTime = (seconds) => {
    return DateTime.fromSeconds(Number(seconds), { zone: 'utc+2' }).toISO({ includeOffset: false, suppressMilliseconds: true });
}

export const roundValue = (value) => {
    return Math.round(value * 100) / 100;
}
