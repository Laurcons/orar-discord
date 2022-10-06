import { DateTime } from "luxon";

const dateFormat = "dd.MM.yyyy";

const yearsForRoEn: Record<number, { semester1: string[][], semester2: string[][] }> = {
    2022: {
        semester1: [["03.10.2022", "23.12.2022"], ["09.01.2023", "20.01.2023"]],
        semester2: [["27.02.2023", "14.04.2023"], ["24.04.2023", "09.06.2023"]],
    },
};

const yearsForHuDe: Record<number, { semester1: string[][], semester2: string[][] }> = {
    2022: {
        semester1: [["03.10.2022", "23.12.2022"], ["09.01.2023", "20.01.2023"]],
        semester2: [["27.02.2023", "07.04.2023"], ["17.04.2023", "09.06.2023"]],
    },
};

export function getNextDayWeekParity(spec: string): "even" | "odd" | "none" {
    const tomorrow = DateTime.now().plus({ days: 1 });
    const weekNumber = tomorrow.weekNumber;
    const year = tomorrow.year;
    const oddeven = (() => {
        if (spec == "MM" || spec == "IM" || spec == "MIM" || spec == "IG")
            return yearsForHuDe;
        return yearsForRoEn;
    })()[year];
    
    const getWeekParityInSemester = (semester: string[][], weekNumber: number): "even" | "odd" | "none" => {
        let weekCount = 0;
        for(const period in oddeven.semester1){
            let startWeek = DateTime.fromFormat(dateFormat, period[0]).weekNumber;
            let endWeek = DateTime.fromFormat(dateFormat, period[1]).weekNumber;
            if(startWeek <= endWeek){
                if(startWeek <= weekNumber && weekNumber <= endWeek){
                    weekCount += weekNumber - startWeek + 1;
                    return weekCount % 2 == 0 ? "even":"odd";
                }else{
                    weekCount += endWeek - startWeek + 1;
                }
            }else{
                if(startWeek <= weekNumber){
                    weekCount += weekNumber - startWeek + 1;
                    return weekCount % 2 == 0 ? "even":"odd";
                }else if(weekNumber <= endWeek){
                    weekCount += (DateTime.fromFormat(dateFormat, period[0]).endOf('year').weekNumber - startWeek + 1) + (endWeek - weekNumber + 1);
                    return weekCount % 2 == 0 ? "even":"odd";
                }else{
                    weekCount += endWeek - startWeek;
                }
            }
        }
        return "none"; 
    }

    let firstParity = getWeekParityInSemester(oddeven.semester1, weekNumber);
    let secondParity = getWeekParityInSemester(oddeven.semester1, weekNumber);

    if(firstParity !== 'none'){
        return firstParity;
    }
    return secondParity;
}