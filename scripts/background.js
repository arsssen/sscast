// Main logic launcher.
chrome.webNavigation.onCompleted.addListener(function (details) {
  // Erase localStorage.
  chrome.tabs.query( { active: true },
    function (tabs) {
      if (!tabs.length) {
        return;
      }
      tab_id = tabs[0].id;
      localStorage[tab_id] = null;
    }
  );
  url = details.url;
  //console.log('onCompleted [' + url + '].');
  startFetchAndInject(url);
});

// Called when injected script finds playable file.
chrome.extension.onMessage.addListener(playableFileParsed);

// -----------------------------------------------------------------------------
// Factory to return a function that will parse the current page and extract
// video or videos.
function startFetchAndInject(url) {
  hostname = getHostname(url);
  if (!hostname) {
    console.log('Failed to parse hostname.');
    return
  }

  if (hostname.indexOf('stepashka.') != -1) {
    console.log('Stepashka url found [' + url + '].');
    injectContentScript(url, 'scripts/decodeu.js','scripts/extract_stepashka.js');
  } else if (hostname.indexOf('seasonvar.') != -1) {
    console.log('Seasonvar url found [' + url + ']');
    injectContentScript(url, 'scripts/decodeu.js', 'scripts/extract_seasonvar.js');
  } else {
    console.log('Unrecognized url, trying all mp4/mkv/webm files.');
    injectContentScript(url, 'scripts/decodeu.js', 'scripts/extract_default.js');
  }
}

function injectContentScript(potential_url, lib_script, content_script) {
  // There are multiple tabs/windows/objects use only normal
  // and the ones that match url.
  chrome.tabs.query(
    { active: true },
    // Actual executed function in tab.
    function (tabs) {
      if (!tabs.length) {
        console.log('No active tab.');
        return;
      }
      tab_id = tabs[0].id;

      // Inject jquery, lib and content script.
      chrome.tabs.executeScript(tab_id, { file: "scripts/jquery.js" },
      function () {
      console.log('JQuery injected');
      chrome.tabs.executeScript(tab_id, { file: lib_script },
      function () {
        console.log('Decoding library injected');
        chrome.tabs.executeScript(tab_id, { file: content_script },
          function(results){
            console.log('Extraction done.', results);
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            }
        });
      });
    });
  });
}

function playableFileParsed(msg) {
    console.log('playableFileParsed', msg);
  var data = msg.files;
  if (data.type == 'single') {
    console.log('Single playable file parsed ['  + data.files + ']');
  } else if (data.type == 'multiple') {
    console.log('Multiple playable files parsed [' + data.files + ']');
  }
  saveFoundFiles(msg);
  chrome.tabs.query( { active: true, windowType: "normal"},
    function (tabs) {
      if (!tabs.length) {
        return;
      }
      localStorage[tabs[0].id] = JSON.stringify(data.files);
      chrome.browserAction.setIcon(
        {tabId : tabs[0].id, path: 'images/tv-ready-to-cast.png'});
      chrome.browserAction.setPopup(
        {tabId : tabs[0].id, popup: 'popup/popup.html'});
      chrome.browserAction.setBadgeText(
        {tabId : tabs[0].id, text : '' + data.files.length});
    }
  )
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
