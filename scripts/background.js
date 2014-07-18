// Some global variables.
known_playable_tabs = new Object;

// Main logic launcher.
chrome.webNavigation.onCompleted.addListener(function (details) {
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
    console.log('Failed to parse hostname.')
    return
  }

  if (hostname.indexOf('stepashka.') != -1) {
    console.log('Stepashka url found [' + url + '].');
    injectContentScript(url,
                        'scripts/decodeu.js',
                        'scripts/extract_stepashka.js');
  } else {
    console.log('Unrecognized url, trying all mp4/mkv/webm files.')
    injectContentScript(url, '', 'scripts/extract_default.js');
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
            console.log('Extraction done.');
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            }
        });
      });
    });
  });
}

function playableFileParsed(data) {
  if (data.type == 'single') {
    console.log('Single playable file parsed ['  + data.files + ']');
  } else if (data.type == 'multiple') {
    console.log('Multiple playable files parsed [' + data.files + ']');
  }
  chrome.tabs.query( { active: true, windowType: "normal"},
    function (tabs) {
      if (!tabs.length) {
        return;
      }
      known_playable_tabs[tabs[0].id] = data.files;
      chrome.browserAction.setIcon(
        {tabId : tabs[0].id, path: 'images/tv-ready-to-cast.png'});
      chrome.browserAction.setPopup(
        {tabId : tabs[0].id, popup: 'popup/popup.html'});
      chrome.browserAction.setBadgeText(
        {tabId : tabs[0].id, text : '' + data.files.length});
    }
  )
}

