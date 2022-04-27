
const enStrings = {
    weekday: {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        invalid: "[[invalid weekday]]"
    },
    weekParity: {
        odd: "Odd week",
        even: "Even week",
        none: "Unknown week parity"
    },
    headerEmbed: {
        title: "{{emoji}} Timetable for group {{group}} spec. {{spec}}",
        description: "For {{day}}, {{date}}",
        tabular: "Tabular",
        graphic: "Graphic",
        github: "GitHub"
    },
    timetableElement: {
        // keep '-' in interpolations to prevent escaping by the framework
        firstRow: "#{{index}}: **_({{-formation}})_ {{-discipline}}**",
        secondRow: "**{{-timeInterval}}** in **{{-location}}**",
        thirdRow: "{{-type}} by {{-teacher}}",
        fourthRow: ":warning: {{-emoji}} Week {{-week}}!",
        ommitted: "Timetable element ommitted due to the week parity.",
        type: {
            // keys are the values from the website
            seminar: "SEMINARY",
            laborator: "LABORATORY",
            curs: "LECTURE"
        },
        typeEmoji: {
            // keys are the values from the website
            // if you do not want the emojis, leave these empty (do NOT remove)
            seminar: ":regional_indicator_s:",
            laborator: ":regional_indicator_l:",
            curs: ":regional_indicator_c:",
        }
    },
    footerEmbed: {
        text: "For {{day}}, {{date}} • {{version}}"
    }
};

export default enStrings;