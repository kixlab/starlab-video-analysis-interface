export function toStrTime(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(14, 5);
}

export function getVideoSegment(segments, timestamp) {
    return segments.find(segment => segment.finish > timestamp);
}

export function roundNumber (num, precision) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}