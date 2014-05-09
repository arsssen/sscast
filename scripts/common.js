// Various service functions

// Get hostname from url.
function getHostname(url) {
    match = url.match(/^http:\/\/([^/]+)/);
    return match ? match[1] : null;
}
