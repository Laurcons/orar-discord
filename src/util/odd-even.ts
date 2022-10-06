import { DateTime } from "luxon";

export type WeekRange = [number, number];
export type WeekRangesForLang = Record<number, WeekRange[]>;
export type GeneralWeekRanges = Record<'roEn' | 'huDe', WeekRangesForLang>;
export type WeekParity = 'even' | 'odd' | 'none';

// merging of semesters' intervals into one is permissible if the first semester
//  has an even number of weeks. in this case, the second semester's intervals
//  can just be added to the first semester's and no difference would occur.
// the following code operates on this assumption. if the assumption isn't met,
//  the week parity is incorrectly determined
// it also assumes that no week interval crosses the year boundary (ie. start < end)
//  if the assumption isn't met, an exception is thrown

const generalWeekRanges: GeneralWeekRanges = {
    roEn: {
        2022: [/* year 21,22 omitted */ [40, 51]],
        2023: [[2, 3], [9, 15], [17, 23], /* year 23-24, here --> */ ]
    },
    huDe: {
        2022: [/* year 21,22 omitted */ [40, 51]],
        2023: [[2, 3], [9, 14], [16, 23], /* year 23-24, here --> */ ]
    },
};

export function getNextDayWeekParity(spec: string): WeekParity {
    const tomorrow = DateTime.now().plus({ days: 1 });
    const weekNumber = tomorrow.weekNumber;
    const year = tomorrow.year;
    const weekRanges = (() => {
        if (spec == "MM" || spec == "IM" || spec == "MIM" || spec == "IG")
            return generalWeekRanges.huDe;
        return generalWeekRanges.roEn;
    })()[year];
    
    const getWeekParityInWeekRanges = (ranges: WeekRange[], weekNumber: number): WeekParity => {
        let weekCount = 0;
        for (const period of ranges){
            const [startWeek, endWeek] = period;
            if (startWeek <= endWeek){
                if(startWeek <= weekNumber && weekNumber <= endWeek){
                    weekCount += weekNumber - startWeek + 1;
                    return weekCount % 2 == 0 ? "even":"odd";
                } else {
                    weekCount += endWeek - startWeek + 1;
                }
            } else {
                throw new Error("Week parity detection expects that no week interval crosses the year boundary. If handling of this is expected, please create an Issue.");
            }
        }
        return "none"; 
    }

    return getWeekParityInWeekRanges(weekRanges, weekNumber);
}