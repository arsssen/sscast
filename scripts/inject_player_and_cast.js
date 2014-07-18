// Content script injecting the player.
console.log('Cast injection script loading');

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
  var cast_api = document.createElement("script");
  cast_api.type = "text/javascript"
  cast_api.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js";
  document.body.appendChild(cast_api);

  console.log("Injecting jQuery");
  var jQueryScr   = document.createElement("script");
  jQueryScr.type  = "text/javascript";
  jQueryScr.src   = chrome.extension.getURL('scripts/jquery.js'),
  document.body.appendChild(jQueryScr);

  var script   = document.createElement("script");
  script.type  = "text/javascript";
  script.src   = chrome.extension.getURL('scripts/cast_content_script.js'),
  document.body.appendChild(script);

  volume_div = '<div>Volume: <input id="kccbSSCastVolume" type="range" min="0" max="100" step="1" onmouseup="setMediaVolume(this.value/100,false);"></div>';
  playpause_button = '<div><button type="button" id="kccbSSCast_play" onClick="playClicked()">Loading</button>';
  progress_bar = '<div>Seek: <input id="kccbSSCastProgress" type="range" min="0" max="1000" step="1" onmouseup="setProgress(this.value/1000, false)"></div>';
  status_div = '<div id="kccbSSCastStatus">Status</div>';

  $('body').append(
    '<div id="kccbSSCastChromecast"><div id="kccbSSCastHeader">SSCast Player</div>'
    + volume_div + '<br/>'
    + progress_bar + '<br/>'
    + playpause_button + '<hr/>'
    + status_div + '</div>');

  var playerStyles = "#kccbSSCastChromecast { position: fixed;top: 0px;background-color: #afafaf;left: 40%;padding: 10px;z-index: 99999999999999;border: 1px solid #000;border-radius: 13px;width: 182px} #kccbSSCast_play{font-family: Arial, Helvetica, sans-serif;font-size: 14px;color: #000000;padding: 5px 10px;background: -webkit-gradient( linear, left top, left bottom, from(#fff), to(#ccc));border: 1px solid #878787;-moz-box-shadow: 0px 1px 3px rgba(000,000,000,0.5), inset 0px 0px 2px rgba(255,255,255,1);box-shadow: 0px 1px 3px rgba(000,000,000,0.5), inset 0px 0px 2px rgba(255,255,255,1);width: 182px;}#kccbSSCastProgress {float:right}#kccbSSCastVolume {float:right} #kccbSSCastHeader{margin-bottom: 10px;font-weight: bold;text-align: center;border-bottom: 1px solid #999;padding-bottom: 5px;}";
  $('body').append('<style>' + playerStyles + '</style>');
  window.setTimeout(function(){$('#kccbSSCastChromecast').drags({handle: '#kccbSSCastHeader'});},1000);
  
  //window.close();
}

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 99999999999999).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);
