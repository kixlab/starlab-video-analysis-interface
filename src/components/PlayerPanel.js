import React, { useEffect, useRef, useState } from "react";

import "../styles/PlayerPanel.css";

import { useSession } from "../contexts/SessionContext";

import YouTube from "react-youtube";


function VideoPlayer({segments}) {
    const {
        videoId,
        playbackState,
        setPlaybackState,
        timerInterval,
    } = useSession();

    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const onStateChange = (event) => {
        if (event.data === 1) {
            // playing
            setIsPlaying(true)
            return;
        }
        if (event.data === 2) {
            // paused
            setIsPlaying(false);
            return;
        }
        if (event.data === 0) {
            // ended
            setIsPlaying(false);
        }
        if (event.data === -1) {
            event.target.seekTo(playbackState.position);
            setIsPlaying(false);
        }
    }; 

    useEffect(() => {
        if (playerRef.current === null) {
            return;
        }
        const player = playerRef.current.getInternalPlayer();
        if (!player) {
            return;
        }
        if (playbackState.updateSource === "user") {
            player.seekTo(playbackState.position);
        }
    }, [
        playbackState.position,
        playbackState.updateSource,
        playerRef,
    ]);

    useEffect(() => {
        const player = playerRef.current?.getInternalPlayer();
        if (!player || !isPlaying) {
            if (playbackState.interval) {
                clearInterval(playbackState.interval);
            }
            return;
        }
        const callback = () => {
            player.getCurrentTime().then((time) => {
                setPlaybackState((prevState) => {
                    return {
                        ...prevState,
                        position: time,
                        updateSource: "player",
                    };
                });
            });
        };
        player.getCurrentTime().then((time) => {
            setPlaybackState((prevState) => {
                if (prevState.interval) {
                    clearInterval(prevState.interval);
                }
                const newInterval = setInterval(callback, timerInterval);
                return {
                    updateSource: "player",
                    position: time,
                    interval: newInterval,
                };
            })
        }).catch((error) => {
            console.error("Error getting current time", error);
            if (playbackState.interval) {
                clearInterval(playbackState.interval);
            }
        });
        return () => {
            if (playbackState.interval) {
                clearInterval(playbackState.interval);
            }
        }
    }, [
        isPlaying,
        playerRef,
        timerInterval,
        setPlaybackState,
    ]);

    return (<div className="video-player">
        <YouTube
            ref={playerRef}
            videoId={videoId}
            opts={{
                playerVars: {
                    controls: 1,
                    showinfo: 0,
                    rel: 0,
                },
            }}
            className="video-player"
            onStateChange={onStateChange}
        />
    </div>);
}

function Timeline({segments}) {
    const {
        videoId,
        setPlaybackState,
    } = useSession();

    const setPlaybackPosition = (newPlaybackPosition) => {
        setPlaybackState((prevState) => {
            return {
                ...prevState,
                position: newPlaybackPosition,
                updateSource: "user",
            };
        });
    };

    if (!videoId) {
        return null;
    }

    return (<div className="timeline">
        <div className="progress-bar">
            {segments.map((s, index) => {
                return (<div
                    key={index} className="progress-segment"
                    onClick={() => setPlaybackPosition(s.start)}
                >
                    <div
                        className={`progress-step`}
                        status={s.status}
                    >
                        <div 
                            style={{ width: `${s.progress}%` }}
                            status={s.status}
                        ></div>
                    </div>
                    <div className="progress-step-label">
                        {s.displayTitle}
                    </div>
                </div>);
            })}
        </div>
    </div>);
}

function PlayerPanel() {
    const {
        videosMapping,
        videoId,
        metaSubgoalTitle,
        setSubgoalTitle,
        playbackState,
    } = useSession();
    
    const [segments, setSegments] = useState([]);
    const [videoTitle, setVideoTitle] = useState(null);

    const getProgressPercentage = (start, finish, playback) => {
        // TODO: Adjust the timings --> currentTime --> actual time
        const currentTime = new Date(playback).getTime();
        const startTime = new Date(start).getTime();
        const finishTime = new Date(finish).getTime();
        
        if (currentTime >= finishTime) return 100;
        if (currentTime <= startTime) return 0;

        if (finishTime === startTime) return 100;
        
        return ((currentTime - startTime) / (finishTime - startTime)) * 100;
    };

    useEffect(() => {
        const video = videoId ? videosMapping[videoId] : null;
        if (!video) {
            setSegments([]);
            return;
        }
        setVideoTitle(video.metadata.title);

        let videoSegments = [{
            start: 0,
            finish: 0,
            title: null,
            displayTitle: ``,
        }]

        for (const curSubgoal of video.subgoals) {
            const curSubgoalTitle = curSubgoal.original_title;
            if (videoSegments.length > 0 && curSubgoalTitle === ``) {
                videoSegments[videoSegments.length - 1].finish = curSubgoal.finish;
            }
            else {
                videoSegments.push({
                    start: curSubgoal.start,
                    finish: curSubgoal.finish,
                    title: curSubgoal.title,
                    displayTitle: curSubgoal.original_title,
                });
            }
        }
        videoSegments.push({
            start: videoSegments[videoSegments.length - 1].finish,
            finish: video.metadata.duration,
            displayTitle: ``,
            title: metaSubgoalTitle,
        })

        for (let segment of videoSegments) {
            segment.progress = getProgressPercentage(segment.start, segment.finish, playbackState.position);
            segment.status = "watching";
            if (playbackState.position < segment.start) {
                segment.status = "unseen";
            }
            if (segment.finish <= playbackState.position) {
                segment.status = "seen";
            }
        }
        setSegments(videoSegments);
    }, [
        videoId,
        metaSubgoalTitle,
        videosMapping,
        playbackState.position,
    ])

    useEffect(() => {
        setSegments((prev) => {
            return prev.map((segment) => {
                const progress = getProgressPercentage(segment.start, segment.finish, playbackState.position);
                let status = "watching";
                if (playbackState.position < segment.start) {
                    status = "unseen";
                }
                else if (segment.finish <= playbackState.position) {
                    status = "seen";
                }
                else {
                    status = "watching";
                }
                return {
                    ...segment,
                    progress: progress,
                    status: status,
                };
            });
        });
    }, [
        playbackState.position,
    ]);

    useEffect(() => {
        setSubgoalTitle((prevTitle) => {
            if (segments.length === 0) {
                return null;
            }
            const currentSegment = segments.find((s) => {
                return s.status === "watching";
            });
            return currentSegment ? currentSegment.title : null;
        });
    }, [
        segments,
        setSubgoalTitle,
    ]);

    return (<div className="player-panel">
        <VideoPlayer
            segments={segments}
        />
        <div className="video-header"> 
            <div className="video-title">
                {videoTitle ? videoTitle : "Choose a video"}
            </div>
            <Timeline 
                segments={segments}
            />
        </div>
        {/* <AlignmentsTranscript /> */}
        {/* <HooksTranscript /> */}
        
    </div>);
}

export default PlayerPanel;