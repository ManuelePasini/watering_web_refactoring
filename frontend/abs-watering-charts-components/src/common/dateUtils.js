import {DateTime} from "luxon";

export const luxonDateTime = (seconds) => {
    return DateTime.fromSeconds(Number(seconds), { zone: 'utc+2' })
}
