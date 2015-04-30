$(document).ready(function(){
    chrome.storage.local.get("files", function(data) {
        console.log('saved data::', data);
        $("#saved").show();
    });
    $("#saved").click(function(){
            chrome.tabs.create({'url': chrome.extension.getURL('popup/saved.html')}, function(tab) {
                // Tab opened.
            });
    });

});