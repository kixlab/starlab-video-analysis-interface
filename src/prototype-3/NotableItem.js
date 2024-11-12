import React, { useEffect, useRef, useState } from 'react';

import '../styles/Notables.css';

import { useSession } from '../contexts/SessionContext';

import { roundNumber, toStrTime } from '../scripts/helpers';

import { CSSTransition } from 'react-transition-group';
import { HOOK_LINKS_TYPES } from '../scripts/constants';

function NotableItem({ notable }) {

    const {
        videoId,
        setPlaybackState,
        setVideoId,
        videoStates,
        queue,
    } = useSession();

    const descriptionNodeRef = useRef(null);
    const comparisonNodeRef = useRef(null);

    const [isHovered, setIsHovered] = useState(false);
    const [seenLinks, setSeenLinks] = useState([]);

    const thumbnailUrl = `https://img.youtube.com/vi/${notable.video_id}/${1}.jpg`;

    const handleHeaderClick = () => {
        if (videoId === notable.video_id) {
            setPlaybackState((prevState) => {
                return {
                    ...prevState,
                    position: notable.seconds ? notable.seconds : 0,
                    updateSource: "user",
                };
            });
        }
        else {
            const result = window.confirm('Are you sure you want to switch to a different video?');
            if (!result) {
                return;
            }
            setVideoId(notable.video_id, notable.seconds ? notable.seconds : 0);
        }
    }

    useEffect(() => {
        const newSeenLinks = [];
        for (const link of notable.links) {
            const otherVideoState = videoStates[link.other_video_id];
            if (!otherVideoState || otherVideoState.status !== 'seen') {
                continue;
            }
            const index = queue.findIndex((item) => item.videoId === link.other_video_id);
            const curLink = {
                ...link,
                index: index >= 0 ? index : null,
            };
            newSeenLinks.push(curLink);
        }
        newSeenLinks.sort((a, b) => {
            if (a.index === null && b.index === null) {
                return 0;
            }
            if (a.index === null) {
                return 1;
            }
            if (b.index === null) {
                return -1;
            }
            return a.index - b.index;
        });
        setSeenLinks(newSeenLinks);
    }, [
        notable.links,
        queue,
        videoStates,
    ]);

    return (<div
        className="notable-item"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <div 
            className="notable-header"
            onClick={() => handleHeaderClick()}
        >
            <div className="notable-thumbnail">
                <img 
                    src={thumbnailUrl}
                    alt="thumbnail"
                />
            </div>
            <div className='notable-header-body'
            >
                <div className='notable-title'>
                    {/* {toStrTime(notable.seconds)} */}
                    {notable.title}
                </div>
                <ul className='notable-description-ul'>
                    <li className='notable-description-top'
                        status={isHovered ? 'expanded' : 'collapsed'}
                    >
                        {notable.description}
                        <CSSTransition
                            nodeRef={descriptionNodeRef}
                            in={isHovered}
                            timeout={300}
                            classNames="description-transition"
                            unmountOnExit
                        >
                            <ul>
                                <li className='notable-description-child'>
                                    {notable.reasoning}
                                </li>
                            </ul>
                        </CSSTransition>
                    </li>
                    <li className='notable-description-top'
                        status={isHovered ? 'expanded' : 'collapsed'}
                    >
                        {/* <span
                            style={{
                                fontStyle: 'italic',
                                textDecoration: 'underline',
                            }}
                        >
                            Comparison: 
                        </span> */}
                        {" " + notable.comparison}
                        <CSSTransition
                            nodeRef={comparisonNodeRef}
                            in={isHovered && seenLinks.length > 0}
                            timeout={300}
                            classNames="description-transition"
                            unmountOnExit
                        >
                            <ul>
                                {seenLinks.map((link) => {
                                    const relation = HOOK_LINKS_TYPES.find((item) => item.type === link.relation);
                                    return <li
                                        className='notable-description-child'
                                        key={link.id}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                color: relation.color,
                                            }}
                                            onClick={() => {
                                                setVideoId(link.other_video_id, 0);
                                            }}
                                        >
                                            {relation.label} to (W-{link.index + 1}):
                                        </span>
                                        <span>
                                            {" " + link.comparison}
                                        </span>
                                    </li>
                                })}
                            </ul>
                        </CSSTransition>
                    </li>
                </ul>
                {/* <CSSTransition
                    nodeRef={nodeRef}
                    in={isHovered}
                    timeout={300}
                    classNames="description-transition"
                    unmountOnExit
                >
                    <div className='notable-body'>
                        
                    </div>
                </CSSTransition> */}
            </div>
            {/* <div className='notable-rating'>
                <div>
                    Importance: {roundNumber(notable.importance / 5, 2)}
                </div>
                <div>
                    Uniqueness: {roundNumber(notable.uniqueness, 2)}
                </div>
                <div>
                    Complexity: {roundNumber(notable.step_aspect_complexity, 2)}
                </div>
            </div> */}
        </div>
    </div>)
}

export default NotableItem;