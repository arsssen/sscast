// Content script injecting the player.
console.log('Cast injection script loading', window.zzz);

if ($('#kccbSSCastChromecast').length == 0) {
  console.log('"Player" not injected. Injecting now.');
  injectPlayerHTML();
}
scrollUP();

function scrollUP() {
  console.log('Scrolling up to the "Player"');
  window.scrollTo(0,0);
}

function injectPlayerHTML() {

    loadScriptByUrl('https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'); //
    loadScriptByUrl(chrome.extension.getURL('scripts/jquery.js'));
    loadScriptByUrl(chrome.extension.getURL('scripts/cast_content_script.js'));


  volume_div = '<div>Volume: <input id="kccbSSCastVolume" type="range" min="0" max="100" step="1" onmouseup="setMediaVolume(this.value/100,false);"></div>';
  playpause_button = '<div><button type="button" id="kccbSSCast_play" onclick="playClicked()">Loading</button>';
  progress_bar = '<div>Seek: <input id="kccbSSCastProgress" type="range" min="0" max="1000" step="1"  onmouseup="setProgress(this.value/1000, false);"></div>';
  status_div = '<div id="kccbSSCastStatus">Status</div>';

  $('body').append(
    '<div id="kccbSSCastChromecast"><div id="kccbSSCastHeader">SSCast Player</div>'
    + volume_div + '<br/>'
    + progress_bar + '<br/>'
    + playpause_button + '<hr/>'
    + status_div + '</div>');

    // set handlers (can't use inline handlers on extension page and these handlers don't work when player is injected on website page, so need to have both until figuring out the problem)
    $("#kccbSSCastChromecast").waitUntilExists(function () {
        $("#kccbSSCast_play").click(function() {playClicked() });
        $("#kccbSSCastVolume").mouseup(function() { setMediaVolume(this.value/100,false); });
        $("#kccbSSCastProgress").mouseup(function() { setProgress(this.value/1000, false); });
        $('#kccbSSCastChromecast').drags({handle: '#kccbSSCastHeader'});
    });
  var playerStyles = "#kccbSSCastChromecast { position: fixed;top: 0px;background-color: #afafaf;left: 40%;padding: 10px;z-index: 99999999999999;border: 1px solid #000;border-radius: 13px;width: 182px} #kccbSSCast_play{font-family: Arial, Helvetica, sans-serif;font-size: 14px;color: #000000;padding: 5px 10px;background: -webkit-gradient( linear, left top, left bottom, from(#fff), to(#ccc));border: 1px solid #878787;-moz-box-shadow: 0px 1px 3px rgba(000,000,000,0.5), inset 0px 0px 2px rgba(255,255,255,1);box-shadow: 0px 1px 3px rgba(000,000,000,0.5), inset 0px 0px 2px rgba(255,255,255,1);width: 182px;}#kccbSSCastProgress {float:right}#kccbSSCastVolume {float:right} #kccbSSCastHeader{margin-bottom: 10px;font-weight: bold;text-align: center;border-bottom: 1px solid #999;padding-bottom: 5px;} #kccbSSCastStatus {word-wrap: break-word}";
  $('body').append('<style>' + playerStyles + '</style>');

  //window.close();
}


