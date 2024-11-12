import DATA from './carbonara.json';
// import DATA from './remove-object.json';


export function get_subgoals() {
    if ("subgoal_definitions" in DATA) {
        return DATA["subgoal_definitions"];
    }
    return [];
}

export function get_videos() {
    if ("videos" in DATA) {
        return DATA["videos"];
    }
    return [];

}
export function get_hooks(approach="approach_1") {
    if ("hooks" in DATA && approach in DATA["hooks"]) {
        return DATA["hooks"][approach];
    }
    return [];
}