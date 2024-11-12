import React, { useEffect, useState } from "react";

import { useSession } from "../contexts/SessionContext";
import LinkItemStatus from "../components/LinkItemStatus";

import "../styles/QueueList.css";

import { BsPlayCircleFill } from "react-icons/bs";
import { MdOutlineTv } from "react-icons/md";

function QueueItem({ item, index }) {
    const {
        hooks,
        videosMapping,
        setVideoId,
        videoId,
        selectedHookLinks,
        setSelectedHookLinks,
    } = useSession();

    const curVideoId = item.videoId;
    const contextHookLinks = item.contextHookLinks;
    const videoTitle = videosMapping[curVideoId].metadata.title;
    const thumbnailUrl = `https://img.youtube.com/vi/${curVideoId}/${1}.jpg`;

    const [isHover, setIsHover] = useState(false);
    const [isContextSelected, setIsContextSelected] = useState(false);
    const [isFilterSelected, setIsFilterSelected] = useState(false);

    const handleItemClick = (event) => {
        event.stopPropagation();
        if (videoId === curVideoId) {
            return;
        }
        if (isFilterSelected) {
            setSelectedHookLinks(() => null);
            return;
        }
        const hookLinksToFilter = hooks.map((hook) => {
            if (!hook?.relation || hook.video_id !== videoId) {
                return [];
            }
            const toFilter = []
            for (const link of hook.links) {
                if (link.other_video_id === curVideoId) {
                    toFilter.push({
                        videoId: videoId,
                        linkId: link.id,
                        sourceVideoId: curVideoId,
                    });
                }
            }
            return toFilter;
        }).reduce((acc, val) => acc.concat(val), []);
        if (hookLinksToFilter.length > 0) {
            setSelectedHookLinks(() => hookLinksToFilter);
            return;
        }
        setSelectedHookLinks(() => [{
            videoId: videoId,
            linkId: null,
            sourceVideoId: curVideoId,
        }]);
        /// find all the hook links that have other_video_id as curVideoId
    };

    const handleContextClick = (event) => {
        event.stopPropagation();
        if (isContextSelected) {
            setSelectedHookLinks(() => null);
            return;
        }
        if (contextHookLinks.length > 0) {
            setSelectedHookLinks(() => contextHookLinks.map((item) => {
                return {
                    videoId: item.videoId,
                    linkId: item.linkId,
                    sourceVideoId: curVideoId,
                };
            }));
            return;
        }
        setSelectedHookLinks(() => [{
            videoId: null,
            linkId: null,
            sourceVideoId: curVideoId,
        }]);
    }

    const handlePlayClick = (event) => {
        event.stopPropagation();
        setVideoId(curVideoId);
    };

    useEffect(() => {
        if (selectedHookLinks === null) {
            setIsContextSelected(() => false);
            setIsFilterSelected(() => false);
            return;
        }
        const curSelectedHookLinks = selectedHookLinks.filter((item) => item.sourceVideoId === curVideoId);
        console.log(curSelectedHookLinks)
        if (curSelectedHookLinks.length > 0) {
            if (curSelectedHookLinks[0].videoId !== videoId) {
                setIsContextSelected(() => true);
                setIsFilterSelected(() => false);
            }
            else {
                setIsContextSelected(() => false);
                setIsFilterSelected(() => true);
            }
        }
        else {
            setIsContextSelected(() => false);
            setIsFilterSelected(() => false);
        }
    }, [
        selectedHookLinks,
        curVideoId,
        videoId,
    ])

    return (<div
        className="queue-item"
        onClick={(event) => handleItemClick(event)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        status={isFilterSelected ? "selected" : (isHover || isContextSelected ? "hover" : "")}
    >
        {
            isHover || isContextSelected ? (<div className="hook-link-buttons">
                <div className="hook-link-button"
                    onClick={(event) => handleContextClick(event)}
                    status = {isContextSelected ? "selected" : ""}
                >
                    <MdOutlineTv />
                </div>
                {
                     videoId !== curVideoId ? (
                        <div className="hook-link-button"
                            onClick={(event) => handlePlayClick(event)}
                        >
                            <BsPlayCircleFill />
                        </div>
                     ) : null
                }
            </div>) : (<div className="hook-link-index">
                {index + 1}
            </div>)
        }
        <div className="queue-item-thumbnail">
            <img 
                src={thumbnailUrl}
                alt="thumbnail"
            />
        </div>
        <div className='queue-item-body'>
            <LinkItemStatus curVideoId={curVideoId} inQueue={false} />
            <div className="queue-item-title">
                {/* {`TODO: Why switch?`} */}
                {videoTitle}
            </div>
        </div>
    </div>);
}

function RelatedVideoItem({ curVideoId, index }) {
    const {
        hooks,
        videosMapping,
        setVideoId,
        videoId,
        selectedHookLinks,
        setSelectedHookLinks,
    } = useSession();

    const videoTitle = videosMapping[curVideoId].metadata.title;
    const thumbnailUrl = `https://img.youtube.com/vi/${curVideoId}/${1}.jpg`;

    const [isHover, setIsHover] = useState(false);
    const [isFilterSelected, setIsFilterSelected] = useState(false);

    const handleItemClick = (event) => {
        event.stopPropagation();
        if (videoId === curVideoId) {
            return;
        }
        if (isFilterSelected) {
            setSelectedHookLinks(() => null);
            return;
        }
        const hookLinksToFilter = hooks.map((hook) => {
            if (!hook?.relation || hook.video_id !== videoId) {
                return [];
            }
            const toFilter = []
            for (const link of hook.links) {
                if (link.other_video_id === curVideoId) {
                    toFilter.push({
                        videoId: videoId,
                        linkId: link.id,
                        sourceVideoId: curVideoId,
                    });
                }
            }
            return toFilter;
        }).reduce((acc, val) => acc.concat(val), []);
        console.log(hookLinksToFilter)
        if (hookLinksToFilter.length > 0) {
            setSelectedHookLinks(() => hookLinksToFilter);
            return;
        }
        setSelectedHookLinks(() => [{
            videoId: curVideoId,
            linkId: null,
            sourceVideoId: videoId,
        }]);
        /// find all the hook links that have other_video_id as curVideoId
    };

    const handlePlayClick = (event) => {
        event.stopPropagation();
        setVideoId(curVideoId);
    };

    useEffect(() => {
        if (selectedHookLinks === null) {
            setIsFilterSelected(() => false);
            return;
        }
        const curSelectedHookLinks = selectedHookLinks.filter((item) => item.sourceVideoId === curVideoId);
        if (curSelectedHookLinks.length > 0) {
            if (curSelectedHookLinks[0].videoId !== videoId) {
                setIsFilterSelected(() => false);
            }
            else {
                setIsFilterSelected(() => true);
            }
        }
        else {
            setIsFilterSelected(() => false);
        }
    }, [
        selectedHookLinks,
        curVideoId,
        videoId,
    ])

    return (<div
        className="queue-item"
        onClick={(event) => handleItemClick(event)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        status={isFilterSelected ? "selected" : (isHover ? "hover" : "")}
    >
        {
            (isHover && videoId !== curVideoId) ? (<div className="hook-link-buttons">
                {/* <div className="hook-link-button"
                    onClick={(event) => handleFilterClick(event)}
                >
                    <MdOutlineFilterAlt />
                </div> */}
                <div className="hook-link-button"
                    onClick={(event) => handlePlayClick(event)}
                >
                    <BsPlayCircleFill />
                </div>
            </div>) : (<div className="hook-link-index">
                {`-`}
            </div>)
        }
        <div className="queue-item-thumbnail">
            <img 
                src={thumbnailUrl}
                alt="thumbnail"
            />
        </div>
        <div className='queue-item-body'>
            <LinkItemStatus curVideoId={curVideoId} inQueue={false} />
            <div className="queue-item-title">
                {/* {`TODO: Why switch?`} */}
                {videoTitle}
            </div>
        </div>
    </div>);
}

function VideoList() {
    const {
        queue,
        videosMapping,
    } = useSession();

    const [relatedVidoes, setRelatedVideos] = useState([]);

    useEffect(() => {
        const curRelatedVideos = Object.keys(videosMapping).filter((videoId) => {
            return !queue.map((item) => item.videoId).includes(videoId);
        });
        setRelatedVideos(() => curRelatedVideos);
    }, [
        queue,
        videosMapping,
    ]);

    return (<div className="queue-panel">
        <div className="queue-list">
            <div className="queue-title">
                Watchlist
            </div>
            {
                queue.map((item, index) => {
                    return (
                        <QueueItem
                            key={`queue-${index}`}
                            item={item}
                            index={index} 
                        />
                    );
                })
            }
            <div className="list-divider">
            </div>
            <div className="queue-title">
                Related Videos
            </div>
            {
                relatedVidoes.map((curVideoId, index) => {
                    return (
                        <RelatedVideoItem
                            key={`related-video-${index}`}
                            curVideoId={curVideoId}
                            index={index} 
                        />
                    );
                })
            }
        </div>
    </div>);
}

export default VideoList;