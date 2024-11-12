import React, { useEffect, useRef, useState } from 'react';

import '../styles/Notables.css';
import InfoFilters from './InfoFilters';
import SubgoalItem from './SubgoalItem';

import { useSession } from '../contexts/SessionContext';
import { FLATTEN_DICT_SEP, flattenDict, unflattenDict } from '../scripts/constants';

import { CSSTransition } from 'react-transition-group';
import { BiToggleLeft, BiToggleRight } from 'react-icons/bi';

function NotablesPanel() {
    const {
        queue,
        subgoals,
        informationLibrary,
        videosMapping,
        videoId,
        metaSubgoalTitle,
        approach,
        unselectedHookTags,
        selectedHookLinks,
        setSelectedHookLinks,
    } = useSession();

    const nodeRef = useRef(null);

    const [informationPerSubgoal, setInformationPerSubgoal] = useState([]);

    const [isMainToggle, setIsMainToggle] = useState(true);

    const handleHeaderToggle = () => {
        if (selectedHookLinks === null) {
            const queueObj = queue.find((item) => item.videoId === videoId);
            if (queueObj) {
                if (queueObj.contextHookLinks.length > 0) {
                    setSelectedHookLinks(() => queueObj.contextHookLinks.map((item) => {
                        return {
                            videoId: item.videoId,
                            linkId: item.linkId,
                            sourceVideoId: videoId,
                        };
                    }));
                    return;
                }
            }
            setSelectedHookLinks(() => [{
                videoId: null,
                linkId: null,
                sourceVideoId: videoId,
            }]);
        }
        else {
            setSelectedHookLinks(() => null);
        }
    };

    useEffect(() => {
        let curSubgoals = [...subgoals, 
            // {
            //     original_title: metaSubgoalTitle,
            //     title: `Overall`,
            // }
        ];
        const selectedVideoIds = {};
        if (selectedHookLinks !== null) {
            selectedHookLinks.forEach((link) => {
                selectedVideoIds[link.videoId] = true;
            });
            if (Object.keys(selectedVideoIds).length === 1 && selectedVideoIds[videoId]) {
                curSubgoals = null;   
            }
        }
        else {
            selectedVideoIds[videoId] = true;
            curSubgoals = null;
        }
        
        if (curSubgoals === null) {
            const video = videoId ? videosMapping[videoId] : null;
            if (video === null) {
                setInformationPerSubgoal([]);
                return;
            }
            curSubgoals = [];
            for (const subgoal of video.subgoals) {
                // check if the subgoal is already in the list
                if (curSubgoals.find((s) => s.original_title === subgoal.original_title)) {
                    continue;
                }
                curSubgoals.push({
                    original_title: subgoal.original_title,
                    title: subgoal.original_title,
                });
            }
            // curSubgoals.push({
            //     original_title: metaSubgoalTitle,
            //     title: `Overall`,
            // });
        }

        const perSubgoal = [];

        for (const curVideoId in selectedVideoIds) {
            if (!informationLibrary[curVideoId]) {
                continue;
            }
            for (const curSubgoal of curSubgoals) {
                const curSubgoalTitle = curSubgoal.original_title;
                const curLibrary = {};
                if (!informationLibrary[curVideoId][curSubgoalTitle]) {
                    continue;
                }
                const flatLibrary = flattenDict(informationLibrary[curVideoId][curSubgoalTitle]);
                for (const [key, informationList] of Object.entries(flatLibrary)) {
                    const aspect = key.split(FLATTEN_DICT_SEP)[0];
                    // TODO: DO we wanna show empty aspects too?
                    if (informationList.length === 0 || unselectedHookTags.find((t) => t === aspect)) {
                        continue;
                    }
                    curLibrary[key] = [];
                    informationList.forEach((information) => {
                        const relation = information.relation ? information.relation : 'notable';
                        if (unselectedHookTags.find((t) => t === relation)) {
                            return;
                        }

                        let newLinks = [];
                        if (selectedHookLinks !== null) {
                            newLinks = information.links.filter(
                                (link) => selectedHookLinks.find(
                                    (l) => (l.linkId === link.id && l.videoId === curVideoId)
                                ) ? true : false
                            );
                            if (newLinks.length === 0) {
                                return;
                            }
                        }
                        else {
                            newLinks = [...information.links];
                        }
                        curLibrary[key].push({
                            ...information,
                            links: newLinks.map((link) => ({...link})),
                        });
                    })
                    if (curLibrary[key].length === 0) {
                        delete curLibrary[key];
                    }
                }

                perSubgoal.push({
                    displayTitle: curSubgoal.title,
                    curSubgoalTitle: curSubgoalTitle,
                    library: unflattenDict(curLibrary),
                });
            }
        }
        setInformationPerSubgoal(perSubgoal);
    }, [
        informationLibrary,
        subgoals,
        videosMapping,
        selectedHookLinks,
        unselectedHookTags,

        approach,
        videoId,
        metaSubgoalTitle,
    ]);

    useEffect(() => {
        if (selectedHookLinks === null) {
            setIsMainToggle(true);
            return;
        }
        for (const hookLink of selectedHookLinks) {
            if (hookLink.videoId === videoId) {
                setIsMainToggle(true);
                return;
            }
        }
        setIsMainToggle(false);
    }, [
        selectedHookLinks,
        videoId,
    ])

    if (!videoId) {
        return null;
    }

    return (<div className="info-panel">
        <InfoFilters />
        <div className="info-panel-header">
            <div className="toggle"
                onClick={() => handleHeaderToggle()}
            >
                {
                    isMainToggle ? <BiToggleLeft /> : <BiToggleRight />
                }
            </div>
            {
                isMainToggle ?  `Interesting information:` : `Watchlisted information:`
            }
        </div>  
        <CSSTransition
            nodeRef={nodeRef}
            in={true}
            timeout={300}
            classNames="info-panel-transition"
        >
            <div className="info-panel-body">
                {
                    informationPerSubgoal.map(({
                        displayTitle,
                        curSubgoalTitle,
                        library,
                    }, index) => {
                        return (<SubgoalItem
                            key={`subgoal-${index}`}
                            displayTitle={displayTitle}
                            curSubgoalTitle={curSubgoalTitle}
                            library={library}
                        />)
                    })
                }
                {
                    informationPerSubgoal.length === 0 ? (
                        <div className="notable-item">
                            <div className='notable-description'>
                                {
                                    isMainToggle ? `Please select enable filters to see...` : `You have not watchlisted any information for this video...`
                                }
                            </div>
                        </div>
                    ) : null
                }
            </div>
        </CSSTransition>
    </div>);
}

export default NotablesPanel;