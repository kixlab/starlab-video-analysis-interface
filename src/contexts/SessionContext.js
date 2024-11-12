import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    get_subgoals,
    get_videos,
    get_hooks,
} from "../dataset/read";
import { HOOK_TYPE, NOTABLE_TYPE } from "../scripts/constants";

const SessionContext = createContext(null);

const HooksProviderObjects = (
    approach,
) => {
    const hooks = useMemo(() => {
        return get_hooks(approach);
    }, [
        approach,
    ]);
    const [unselectedHookTags, setUnselectedHookTags] = useState([]);
    const [selectedHookLinks, setSelectedHookLinks] = useState(null);

    const informationLibrary = useMemo(() => {
        // video_id -> subgoal --> aspect --> notable info & hooks
        const library = {};
        for (const hook of hooks) {
            const video_id = hook.video_id;
            const subgoal = hook.subgoal;
            const aspect = hook.aspect;
            const relation = hook?.relation || null; // null, 'additional', or 'alternative'
            const informationType = relation === null ? NOTABLE_TYPE: HOOK_TYPE;
            if (!(video_id in library)) {
                library[video_id] = {};
            }
            if (!(subgoal in library[video_id])) {
                library[video_id][subgoal] = {};
            }
            if (!(aspect in library[video_id][subgoal])) {
                library[video_id][subgoal][aspect] = {};
            }
            if (!(informationType in library[video_id][subgoal][aspect])) {
                library[video_id][subgoal][aspect][informationType] = [];
            }
            library[video_id][subgoal][aspect][informationType].push(hook);
        }
        return library;
    }, [
        hooks,
    ]);
    return {
        hooks,
        informationLibrary,

        unselectedHookTags,
        setUnselectedHookTags,
        selectedHookLinks,
        setSelectedHookLinks,
    };
}

const StateProviderObjects = (
    videosMapping,
) => {

    const timerInterval = 1000;
    const [playbackState, setPlaybackState] = useState({
        position: 0,
        updateSource: null, // 'user' / 'video'
        interval: null,
    });

    const [videoStates, setVideoStates] = useState(useMemo(() => {
        const videoStates = {};
        Object.keys(videosMapping).forEach((id) => {
            videoStates[id] = {
                lastPlaybackPosition: 0,
                status: "unseen", // unseen, seen, watching, queued
                watchOrder: null,
            }
        });
        const newVideoId = Object.keys(videosMapping)[0];
        videoStates[newVideoId].status = "watching";
        videoStates[newVideoId].watchOrder = 0;
        return videoStates;
    }, [
        videosMapping,
    ]));

    const [queue, setQueue] = useState([]);

    const [videoId, __setVideoId] = useState(null);

    const [subgoalTitle, setSubgoalTitle] = useState(null);

    const setVideoId = (newVideoId, newPlaybackPosition = null, linkId = null) => {
        setVideoStates((prev) => {
            const newStates = {...prev};
            if (videoId in newStates) {
                newStates[videoId] = {
                    ...prev[videoId],
                    status: "seen",
                    lastPlaybackPosition: playbackState.position,
                };
            }
            if (newVideoId in newStates) {
                const oldWatchOrder = newStates[newVideoId]?.watchOrder || queue.length + 1;
                newStates[newVideoId] = {
                    ...newStates[newVideoId],
                    status: "watching",
                    lastPlaybackPosition: newPlaybackPosition || videoStates[newVideoId]?.lastPlaybackPosition || 0,
                    watchOrder:  oldWatchOrder + 1,
                };
            }
            return newStates;
        });
        /// TODO: may need to reconsider this, how else we can handle this???
        setQueue((prev) => {
            if (prev.find((item) => item.videoId === newVideoId)) {
                return prev;
            }
            return [
                ...prev,
                {
                    videoId: newVideoId,
                    contextHookLinks: (linkId && videoId) ? [{
                        videoId: videoId,
                        linkId: linkId,
                    }] : [],
                },
            ];
        });
    };
    useEffect(() => {
        const watchingVideoId = Object.keys(videoStates).find((id) => videoStates[id].status === "watching");
        __setVideoId(watchingVideoId);
        setQueue((prev) => {
            if (prev.find((item) => item.videoId === watchingVideoId)) {
                return prev;
            }
            return [
                ...prev,
                {
                    videoId: watchingVideoId,
                    contextHookLinks: [],
                },
            ];
        });
    }, [
        videoStates,
    ]);

    useEffect(() => {
        setPlaybackState((prev) => {
            if (prev.interval) {
                clearInterval(prev.interval);
            }
            return {
                interval: null,
                updateSource: null,
                position: videoId ? videoStates[videoId].lastPlaybackPosition : 0,
            };
        });
    }, [
        videoId,
        videoStates,
    ]);

    return {
        videoStates,
        setVideoStates,

        queue,
        setQueue,

        videoId,
        setVideoId,
        
        subgoalTitle,
        setSubgoalTitle,

        timerInterval,
        
        playbackState,
        setPlaybackState,
    };
}

export const SessionProvider = ({approach, children}) => {
    console.log('update-all')
    const metaSubgoalTitle = "$meta$";
    let subgoals = get_subgoals();
    subgoals = subgoals.map((subgoal) => {
        return {
            ...subgoal,
            original_title: subgoal?.original_title ? subgoal.original_title : subgoal.title,
        };
    });

    const videos = get_videos();

    const videosMapping = useMemo(() => {
        if (!videos) {
            return {};
        }
        const mapping = {};
        videos.forEach((video) => {
            mapping[video.video_id] = {
                ...video,
            };
        });
        return mapping;
    }, [
        videos,
    ]);

    // const alignments = AlignmentsProviderObjects(approach);

    const hooks = HooksProviderObjects(
        approach,
    );

    const state = StateProviderObjects(
        videosMapping,
    );


    return (<SessionContext.Provider value={{
        subgoals,
        videosMapping,
        metaSubgoalTitle,
        approach,

        // ...alignments,
        ...hooks,
        ...state,
    }}>
        {children}
    </SessionContext.Provider>);
};

export const useSession = () => useContext(SessionContext);