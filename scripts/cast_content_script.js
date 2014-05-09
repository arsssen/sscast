// Content script to inject into page to support player.
var currentVolume = 0.5;
var progressFlag = 1;
var currentMediaSession = null;
var session = null;
var DEBUG = true;
//NOTE: kccbSSCastPlayableFile var contains file url to play.

togglePlay('Wait.');
setStatus('Init session.');
if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, 1000);
}

setTimeout(updateProgress, 5000);

function doIOwnTheVideo() {
  if (currentMediaSession ) {
    setStatus(currentMediaSession.media.contentId);
    setStatus(kccbSSCastPlayableFile);
  }

  setStatus(currentMediaSession);

  return currentMediaSession != null && currentMediaSession != 0
            && currentMediaSession.media.contentId == kccbSSCastPlayableFile;
}

function playClicked() {
  var iOwn = doIOwnTheVideo();
  if (!iOwn) {
    // Take ownership.
    togglePlay('Loading');
    setStatus('Either there is no media, or it is not mine.');
    launchCastAndPlay();
    return;
  }
  setStatus('I own the media.');
  // Media playing is mine. Pause/restert etc.
  if (!currentMediaSession) {
    setStatus('Bad session!');
    initializeCastApi();
    return;
  }
  setStatus(currentMediaSession.playerState);
  if (currentMediaSession.playerState == 'PLAYING' ||
      currentMediaSession.playerState == 'BUFFERING') {
    setStatus('Pausing.');
    currentMediaSession.pause(null,
      function() {
        setStatus('Paused.');
        togglePlay('Play');
      },
      function (error) {
        setStatus('Error ' + error.description);
      });
  } else if(currentMediaSession.playerState == 'PAUSED') {
    setStatus('Playing.');
    currentMediaSession.play(null,
      function() {
        setStatus('Playing.');
        togglePlay('Pause');
      },
      function(error) {
        setStatus('Error ' + error.description);
      }
    );
  }
}

function updateProgress() {
  setStatus('updating status');
  if (currentMediaSession) {
    $('#kccbSSCastProgress').val(parseInt(
      1000 * currentMediaSession.currentTime /
        currentMediaSession.media.duration));
    setStatus(currentMediaSession.playerState + " : " 
              + currentMediaSession.currentTime);
  }
  setTimeout(updateProgress, 5000);
}
// ----------------------- Cast functions ---------------------------
function initializeCastApi() {
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, 1000);
    return;
  }
  setStatus('Initializing chromecast');
  var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    sessionListener,
    function(e) {
      if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
        setStatus('Receiver found.');
        togglePlay('Play');
      } else {
        setStatus('Receiver list empty.' + e);
      }
    },
    chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

  chrome.cast.initialize(apiConfig, function() {
    setStatus('Cast initialized.');
  }, function (error) {
    setStatus('Cast failure : ' + error.description);
  });
}

function sessionListener(e) {
  setStatus('Session ID: ' + e.sessionId);
  session = e;
  if (session.media.length != 0) {
    setStatus('Found ' + session.media.length + ' existing media sessions.');
    onMediaDiscovered('onRequestSessionSuccess_', session.media[0]);
  }
  session.addMediaListener(
      onMediaDiscovered.bind(this, 'addMediaListener'));
  session.addUpdateListener(sessionUpdateListener.bind(this));
}

function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  setStatus(message);
  if (!isAlive) {
    session = null;
  }
}

function onMediaDiscovered(how, mediaSession) {
  console.log("new media session ID:" + mediaSession.mediaSessionId);
  currentMediaSession = mediaSession;
  mediaSession.addUpdateListener(onMediaStatusUpdate);
  mediaCurrentTime = currentMediaSession.currentTime;
  togglePlay('Pause');
}

function launchCastAndPlay() {
  if (session) {
    loadVideoAndPlay();
    return;
  }
  chrome.cast.requestSession(function(new_session){
    setStatus('Created new session.');
    session = new_session;
    if (session.media.length != 0) {
      setStatus('Found ' + session.media.length + ' existing media sessions.');
      onMediaDiscovered('onRequestSessionSuccess_', session.media[0]);
      return;
    }
    loadVideoAndPlay();
  }, function(error) {
    setStatus('Session request failure: ' + error.description);
  });
}

function loadVideoAndPlay() {
  setStatus('Playing URL' + kccbSSCastPlayableFile)
  var mediaInfo = new chrome.cast.media.MediaInfo(kccbSSCastPlayableFile);
  // Yet to see anyone with mkv...
  mediaInfo.contentType = 'video/mp4';
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = true;
  request.currentTime = 0;

  var payload = {
    "title:" : kccbSSCastPlayableFile
  };

  var json = {
    "payload" : payload
  };

  request.customData = json;
  session.loadMedia(request,
    function (media) {
      currentMediaSession = media;
      $('#kccbSSCastProgress').val(0);
      togglePlay('Pause');
    },
    function (error) {
      setStatus('URL cannot be played.' + error);
    });
}

function setMediaVolume(level, mute) {
  if( !currentMediaSession )
    return;

  var volume = new chrome.cast.Volume();
  volume.level = level;
  currentVolume = volume.level;
  volume.muted = mute;
  var request = new chrome.cast.media.VolumeRequest();
  request.volume = volume;
  currentMediaSession.setVolume(request,
    function() {
      setStatus('Volume succesfully set');
    },
    function(error) {
      setStatus('Error + [' + error + ']');
    });
}

function onMediaStatusUpdate(isAlive) {
  if( progressFlag ) {
    $('#kccbSSCastProgress').val(parseInt(
      1000 * currentMediaSession.currentTime /
              currentMediaSession.media.duration));
  }
  if (!doIOwnTheVideo()) {
    togglePlay('Stop old one. Play new');
  } else {
    setStatus('I own the media');
  }
  setStatus(currentMediaSession.playerState);
}

function setProgress(pos) {
  progressFlag = 0;
  var request = new chrome.cast.media.SeekRequest();
  setStatus(pos);
  request.currentTime = pos * currentMediaSession.media.duration;
  currentMediaSession.seek(request,
    function () {
      setStatus('Succesfully set position');
    },
    function (onError){
      setStatus('Seek failed');
    });
}
function setStatus(message) {
  $('#kccbSSCastStatus').text(message);
  if (DEBUG) {
    console.log(message);
  }
}

function togglePlay(what) {
  $('#kccbSSCast_play').text(what);
}
