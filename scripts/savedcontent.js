$(document).ready(function () {

    function playFile(url) {
        console.log('File ' + url + ' selected for playback.');
        // Doesn't following look retarded? :(
        window.kccbSSCastPlayableFile =  escape(url);
        console.log('Injecting api support.');
        loadScriptByUrl('../scripts/inject_player_and_cast.js');

    }

    function removeUrl(url, callback) {
        console.log('File ' + url + ' selected for removal.');
        chrome.storage.local.get("files", function (data) {
            var files = data.files;
            var site, title, i;
            for (site in files) {
                for (title in files[site]) {
                    for (i = 0; i < files[site][title].length; i++) {
                        if (files[site][title][i] === url) {
                            files[site][title].splice(i, 1);
                            callback();
                        }
                    }
                    console.log(files[site][title]);
                    if (files[site][title].length === 0) {
                        delete files[site][title];
                    }
                }
                if (!objCount(files[site])) {
                    delete files[site];
                }
            }
            console.log(files);
            chrome.storage.local.set({files: files});
        });

    }

    var html = "";

    chrome.storage.local.get("files", function (data) {
        var files = data.files;
        var site, title, i;
        for (site in files) {
            html += '<h1>' + site + '</h1>';
            for (title in files[site]) {
                html += '<h2>' + title + '</h2>';
                html += '<ul>';
                for (i = 0; i < files[site][title].length; i++) {
                    html += '<li url="'+ files[site][title][i] +'">';
                    html += '<button class="play">' + files[site][title][i].split('/').pop() + '</button> ';
                    html += '<button class="remove">x</button>';
                    html += '</li>';
                }
                html += '</ul>';
            }
        }
        $("#savedfiles").html(html);
        $("#savedfiles ul li button.play").click(function () {
            playFile($(this).parent().attr("url"));
        });
        $("#savedfiles ul li button.remove").click(function () {
            var that = this;
            removeUrl($(this).parent().attr("url"), function () {
                $(that).parent().detach();
            });
        });
    });
    $("#cast-url").click(function() { playFile($("#url").val()); });
});