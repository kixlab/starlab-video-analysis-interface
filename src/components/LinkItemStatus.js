import React, {useState, useEffect} from "react";

import { useSession } from "../contexts/SessionContext";

import { LINK_STATUS} from "../scripts/constants";

import "../styles/LinkItemStatus.css";

function LinkItemStatus({ curVideoId, inQueue }) {
    const {
        videoStates,
    } = useSession();
    const videoStateStatus = videoStates?.[curVideoId]?.status;

    const [status, setStatus] = useState(LINK_STATUS[0]);

    useEffect(() => {
        const curStatusType = (inQueue && videoStateStatus !== "seen") ? "queued" : videoStateStatus;
        const status = LINK_STATUS.find((status) => status.type === curStatusType);
        setStatus(status);
    }, [
        curVideoId,
        inQueue,
        videoStates,
        videoStateStatus,
    ]);
    return (<div 
        className="hook-link-status"
        type={status.type}
    >
        {status.icon}
        {status.label}
    </div>)
}

export default LinkItemStatus;