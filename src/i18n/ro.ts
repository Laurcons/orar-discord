
const roStrings = {
    weekday: {
        monday: "luni",
        tuesday: "marți",
        wednesday: "miercuri",
        thursday: "joi",
        friday: "vineri",
        invalid: "[[zi invalidă]]"
    },
    weekParity: {
        odd: "Săptămână impară",
        even: "Săptămână pară",
        none: "Paritatea săptămânii este necunoscută"
    },
    headerEmbed: {
        title: "{{emoji}} Orar grupa {{group}} specializ. {{spec}}",
        description: "Pentru {{day}}, {{date}}",
        tabular: "Tabelar",
        graphic: "Grafic",
        github: "GitHub"
    },
    timetableElement: {
        // keep '-' in interpolations to prevent escaping by the framework
        firstRow: "#{{index}}: **_({{-formation}})_ {{-discipline}}**",
        secondRow: "**{{-timeInterval}}** în **{{-location}}**",
        thirdRow: "{{-type}} de {{-teacher}}",
        fourthRow: ":warning: {{-emoji}} Săptămâna {{-week}}!",
        ommitted: "Materie omisă din cauza parității săptămânii.",
        type: {
            // keys are the values from the website
            seminar: "SEMINAR",
            laborator: "LABORATOR",
            curs: "CURS"
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
        text: "Pentru {{day}}, {{date}} • {{version}}"
    }
};

export default roStrings;