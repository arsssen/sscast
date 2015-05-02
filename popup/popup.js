// Scripts supporting the popup.
var tabId = 0;

$(document).ready(function(){
  chrome.tabs.query({active: true, windowType: 'normal'}, fillFiles);
});

function fillFiles(tabs) {
  tabId = tabs[0].id;
  files = JSON.parse(localStorage[tabId]);
  if (files != null) {
    console.log(files);
    $('#files').html();
    // Uuuugly.
    $.each(files, function(index, url) {
      var filename = url.split('/').pop();
      var extension = filename.split('.').pop();
      var unsupported = false;
      if (extension.toLowerCase() === 'flv') {
        unsupported = true;
      }
      $('#files').append('<nobr><button class="css3button ' + (unsupported ? 'unsupported' : '') + '" id="btn_' + index
                          + '">' + (unsupported ? 'flv not supported ' : ' Cast ') +  filename + '</button>'
                          + '<br/>');
      if (!unsupported) {
          $('#btn_' + index).click({tabId: tabId, file: url }, buttonClicked);
      }
    });
  }
}

function buttonClicked(event) {
  tabId = event.data.tabId;
  media = event.data.file;
  console.log('File ' + media + ' selected for playback.');
  chrome.tabs.executeScript(tabId, { file: "scripts/jquery.js" },
    function () {
      console.log('Injecting file name.');
      // Doesn't following look retarded? :(
      chrome.tabs.executeScript(tabId, {
        code: 'var file_script = document.createElement("script");' +
              'file_script.text = "var kccbSSCastPlayableFile=\''
              + escape(media) + '\';";' +
              'file_script.type = "text/javascript";' +
              'document.body.appendChild(file_script);' },
        function () {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
          }
          console.log('Injecting api support.');
          chrome.tabs.executeScript(tabId, {
            file: 'scripts/inject_player_and_cast.js'
          },
          function() {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            }
            window.close();
          })
        })
    });
}
