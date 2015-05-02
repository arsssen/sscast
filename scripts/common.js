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


function saveFoundFiles(data) {
    console.log('saveFoundFiles', data);
    chrome.storage.local.get("files", function(previous) {
    console.log("previous: ", previous);
      toStore = JSON.parse(JSON.stringify(previous.files || {}));
        toStore[data.site] = toStore[data.site] || {};
        toStore[data.site][data.title] = toStore[data.site][data.title] || [];
      var i;
      for (i = 0; i < data.files.files.length; i++) {
          if (toStore[data.site][data.title].indexOf(data.files.files[i]) === -1 ) {
              toStore[data.site][data.title].push(data.files.files[i])
          }
      }
        console.log('toStore', toStore);
    chrome.storage.local.set({'files': toStore}, function(a) {
      console.log('saved');
    });
  });

}