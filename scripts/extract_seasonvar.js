// Module to extract and decode seasonvar video file from page.
table1 =  ["J", "p", "v", "n", "s", "R", "0", "3", "T", "m", "w", "u", "9", "x", "g", "a", "G", "L", "U", "X", "z", "t", "b", "7", "H", "="];
table2 =  ["f", "N", "W", "5", "e", "l", "V", "D", "y", "Z", "I", "i", "M", "o", "Q", "1", "B", "8", "2", "6", "c", "d", "4", "Y", "k", "C"];
// Grab url to encoded string.
console.log('Extracting seasonvar URL.');
flashvars = $('object').find('param[name="flashvars"]').val()
if (flashvars.indexOf('pl=') != -1) {
  console.log('pl= type.');
  // Seasonvar though doesn't use the data pointed to by st=.
  // Instead the "pl" parameter actually contains the link to json.
  index = flashvars.indexOf('pl=');
  url = flashvars.substring(index + 3); // lenigth of pl=
  url = url.substring(0, url.indexOf("&"));
  url = decodeUnobfuscated(url, table1, table2);
  console.log('retrieving [' + url + ']');
  $.get(url, function(data) {
    json = JSON.parse(data);
    data = {}
    // Seasonvar has no single videos.
    if ('playlist' in json) {
      data = { type : 'multiple', files : [] }
      $.each(json.playlist, function(i, episode) {
          data.files.push(episode.file);
      });
      chrome.extension.sendMessage(data);
    } else {
      console.log('Cannot parse seasonvar data');
    }
  });
} else {
   // Is there a file equals type???
   console.log('Unknown param [' + flashvars + ']');
}
