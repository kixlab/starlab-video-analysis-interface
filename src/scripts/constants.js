import { IoEye, IoEyeOff } from "react-icons/io5"
import { MdOutlineQueuePlayNext, MdSmartDisplay } from "react-icons/md"


export const decayValue = 0.5;
export const relevanceWeight = 0.4;

export const HOOK_LINKS_TAGS = [
    // {
    //     type: 'goal',
    //     order: 1,
    //     title: '',
    //     label: "Goal",
    // },
    {
        type: 'materials',
        order: 1,
        title: '',
        label: "Materials",
        category: 'input',
    },
    {
        type: 'outcome',
        order: 2,
        title: '',
        label: "Outcome",
        category: 'output',
    },
    {
        type: 'tools',
        order: 3,
        title: '',
        label: "Tools",
        category: 'approach-main',
    },
    {
        type: 'instructions',
        order: 4,
        title: '',
        label: "Instructions",
        category: 'approach-main',
    },
    {
        type: 'explanation',
        order: 6,
        title: '',
        label: "Explanation",
        category: 'approach-sub',
    },
    {
        type: 'tips',
        order: 5,
        title: '',
        label: "Tips",
        category: 'approach-sub',
    },
    // {
    //     type: 'other',
    //     order: 7,
    //     title: '',
    //     label: "Other",
    //     category: 'other',
    // },
];

export const HOOK_LINKS_TYPES = [
    {
        type: 'notable',
        order: 0,
        title: "",
        label: "Notable",
        includedRelation: 'notable',
        color: "#333",
        backgroundColor: "#e2e2e2",
    },
    {
        type: 'additional',
        order: 1,
        title: "",
        label: "Additional",
        includedRelation: 'supplementary',
        color: "#a17d28",
        backgroundColor: "#fff0cc",
    },
    {
        type: 'alternative',
        order: 2,
        title: "",
        label: "Alternative",
        includedRelation: 'contradictory',
        color: "#6b0504",
        backgroundColor: "#ffcccc",
    },
]

export const FLATTEN_DICT_SEP = '~~';
export const NOTABLE_TYPE = 'notable';
export const HOOK_TYPE = 'hook';

export const flattenDict = (dict) => {
    if (!(dict instanceof Object) || dict instanceof Array) {
        return dict;
    }
    const result = {};
    for (const key in dict) {
        if (dict[key] instanceof Object && !(dict[key] instanceof Array)) {
            const flatObject = flattenDict(dict[key]);
            for (const flatKey in flatObject) {
                result[key + FLATTEN_DICT_SEP + flatKey] = flatObject[flatKey];
            }
        } else {
            result[key] = dict[key];
        }
    }
    return result;
}

export const unflattenDict = (dict) => {
    const result = {};
    for (const key in dict) {
        const keys = key.split(FLATTEN_DICT_SEP);
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = dict[key];
    }
    return result;
}

export const LINK_STATUS = [
    {
        type: 'unseen',
        icon: <IoEyeOff />,
        label: 'Not Yet Watched',
    },
    {
        type: 'seen',
        icon: <IoEye />,
        label: 'Already Watched',
    },
    {
        type: 'watching',
        icon: <MdSmartDisplay />,
        label: 'Currently Watching',
    },
    // {
    //     type: 'queued+watching',
    //     icon: <MdSmartDisplay />,
    //     label: 'In Watchlist',
    // },
    {
        type: 'queued',
        icon: <MdOutlineQueuePlayNext />,
        label: 'Added to Watchlist',
    },
]