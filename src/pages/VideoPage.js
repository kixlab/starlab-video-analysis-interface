import React from "react";

import '../styles/VideoPage.css';

import PlayerPanel from "../components/PlayerPanel";
import NotablesPanel from "../prototype-3/NotablesPanel";
import VideoList from "../prototype-3/VideoList";

function VideoPage() {

    return (<div className="main-page">
        <div className="left-panel">
            <PlayerPanel />
            <VideoList />
        </div>
        <div className="right-panel">
            <NotablesPanel />
        </div>
    </div>);
}

export default VideoPage;