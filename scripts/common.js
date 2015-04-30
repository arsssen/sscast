// Various service functions

// Get hostname from url.
function getHostname(url) {
    match = url.match(/^http:\/\/([^/]+)/);
    return match ? match[1] : null;
}

function objCount(obj) {
    if (!obj) {
        return 0;
    }
    if (obj.length) {
        return obj.length;
    }
    var k, count = 0;
    for (k in obj) {
        if (obj.hasOwnProperty(k)) {
            ++count;
        }
    }
    return count;

}

function loadScriptByUrl(url) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = url;
    document.body.appendChild(s);
}