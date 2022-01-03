
export function getSpecializationFromGroup(group: string) {
    const year = group[1];
    const code = group[0];
    const prefix = (() => {
        switch (code) {
            case "1": return "M";
            case "2": return "I";
            case "3": return "MI";
            case "4": return "MM";
            case "5": return "IM";
            case "6": return "MIM";
            case "7": return "IG";
            case "8": return "MIE";
            case "9": return "IE";
            default: throw Error("Invalid group: cannot infer specialization");
        }
    })();
    return prefix + year;
}