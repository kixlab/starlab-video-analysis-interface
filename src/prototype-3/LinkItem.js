import React, { useEffect, useRef, useState } from 'react';

import '../styles/Notables.css';

import { useSession } from '../contexts/SessionContext';
import LinkItemStatus from '../components/LinkItemStatus';

import { BsPlayCircleFill } from 'react-icons/bs';
import { MdOutlineAddToQueue, MdOutlineRemoveFromQueue } from 'react-icons/md';
import { CSSTransition } from 'react-transition-group';
import { roundNumber } from '../scripts/helpers';

function LinkItem({ link, index }) {
    const {
        videoId,
        queue,
        setQueue,
        setVideoId,
        setPlaybackState,
    } = useSession();

    const nodeRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);

    const thumbnailUrl = `https://img.youtube.com/vi/${link.other_video_id}/${1}.jpg`;
    const queueObj = queue.find((item) => item.videoId === link.other_video_id);

    const handleQueueClick = () => {
        if (isInQueue) {
            if (queueObj.contextHookLinks.length === 1) {
                // ask for confirmation with a pop-up
                const result = window.confirm('Are you sure you want to remove this link from the queue?');
                if (!result) {
                    return;
                }
                setQueue((prev) => {
                    return prev.filter((item) => item.videoId !== link.other_video_id);
                });
            }
            else {
                setQueue((prev) => {
                    return prev.map((item) => {
                        if (item.videoId === link.other_video_id) {
                            return {
                                ...item,
                                contextHookLinks: item.contextHookLinks.filter((l) => l.linkId !== link.id),
                            };
                        }
                        return item;
                    });
                });
            }
        }
        else {
            if (queueObj) {
                setQueue((prev) => {
                    return prev.map((item) => {
                        if (item.videoId === link.other_video_id) {
                            return {
                                ...item,
                                contextHookLinks: [
                                    ...item.contextHookLinks,
                                    {
                                        linkId: link.id,
                                        videoId: videoId,
                                    },
                                ],
                            };
                        }
                        return item;
                    });
                });
            }
            else {
                setQueue((prev) => {
                    return [
                        ...prev,
                        {
                            videoId: link.other_video_id,
                            contextHookLinks: [{
                                linkId: link.id,
                                videoId: videoId,
                            }],
                        },
                    ];
                });
            }
        }
    }

    const handlePlayClick = () => {
        if (link.otherVideoId !== videoId) {
            const result = window.confirm('Are you sure you want to switch to another video?');
            if (!result) {
                return;
            }
            setVideoId(link.other_video_id, link?.other_seconds ? link.other_seconds : 0, link.id);
        }
        else {
            setPlaybackState((prevState) => {
                return {
                    ...prevState,
                    position: link?.other_seconds ? link.other_seconds : 0,
                    updateSource: "user",
                };
            });
        }
    }

    useEffect(() => {
        const isIn = (queueObj && (queueObj.contextHookLinks.find((l) => l.videoId === videoId && l.linkId === link.id))) ? true : false;
        // const isIn = queueObj && true | false;
        setIsInQueue(isIn);
    }, [
        queueObj,
        link,
        videoId,
    ]);

    return (<div
        className="hook-link"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        {
            isHovered ? (<div className="hook-link-buttons">
                <div className="hook-link-button"
                    onClick={() => handleQueueClick()}
                >
                    { isInQueue ? <MdOutlineRemoveFromQueue /> : <MdOutlineAddToQueue />}
                </div>
                <div className="hook-link-button"
                    onClick={() => handlePlayClick()}
                >
                    <BsPlayCircleFill />
                </div>
            </div>) : (<div className="hook-link-index">
                {index === null ? "-" : index + 1}
            </div>)
        }
        <div className="hook-link-thumbnail">
            <img 
                src={thumbnailUrl}
                alt="thumbnail"
            />
        </div>
        <div className='notable-header-body'>
            <div>
                <LinkItemStatus curVideoId={link.other_video_id} inQueue={isInQueue} />
            </div>
            <div className="notable-title">
                {link.title}
            </div>
            <CSSTransition
                nodeRef={nodeRef}
                in={isHovered}
                timeout={300}
                classNames="description-transition"
                unmountOnExit
            >
                <ul className='notable-description-ul'>
                    <li className='notable-description-top'>
                        {link.description}
                    </li>
                    {/* <li className='notable-description-top'>
                        {link.comparison}
                    </li> */}
                </ul>
            </CSSTransition>
            <CSSTransition
                nodeRef={nodeRef}
                in={isHovered}
                timeout={300}
                classNames="description-transition"
                unmountOnExit
            >
                <div className="hook-link-description">
                    
                </div>
            </CSSTransition>
        </div>
        {/* <div className='notable-rating'>
            <div>
                Importance: {roundNumber(link.importance / 5, 2)}
            </div>
            <div>
                Uniqueness: {roundNumber(link.uniqueness, 2)}
            </div>
            <div>
                Complexity: {roundNumber(link.step_aspect_complexity, 2)}
            </div>
        </div> */}
    </div>);
}

export default LinkItem;