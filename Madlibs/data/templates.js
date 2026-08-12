// templates.js
// Mad Libs story templates. Each `text` contains `{key}` placeholders that
// correspond to an entry in `blanks` by `key`.

const templates = [
    {
        id: 'backyard-adventure',
        title: 'Backyard Adventure',
        text: 'The {adjective} {noun} {verb} over the fence and landed in the {place}.',
        blanks: [
            { key: 'adjective', label: 'Adjective' },
            { key: 'noun', label: 'Noun' },
            { key: 'verb', label: 'Verb (past tense)' },
            { key: 'place', label: 'Place' },
        ],
    },
    {
        id: 'space-mission',
        title: 'Space Mission',
        text: 'Captain {name} piloted a {adjective} spaceship to the planet {planet}, then {verb} with excitement.',
        blanks: [
            { key: 'name', label: 'Name' },
            { key: 'adjective', label: 'Adjective' },
            { key: 'planet', label: 'Planet name' },
            { key: 'verb', label: 'Verb (past tense)' },
        ],
    },
    {
        id: 'kitchen-disaster',
        title: 'Kitchen Disaster',
        text: 'While baking a {adjective} cake, {name} accidentally added {number} cups of {ingredient} instead of sugar.',
        blanks: [
            { key: 'adjective', label: 'Adjective' },
            { key: 'name', label: 'Name' },
            { key: 'number', label: 'Number' },
            { key: 'ingredient', label: 'Ingredient' },
        ],
    },
];

export default templates;
