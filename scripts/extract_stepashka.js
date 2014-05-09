// Module to extract and decode stepashka video file from page.
stepashka_table1 =  ["G", "d", "R", "0", "M", "Y", "4", "v", "6", "u", "t", "i", "f", "c", "s", "l", "B", "5", "n", "2", "V", "Z", "J", "m", "L", "="];
stepashka_table2 =  ["1", "w", "Q", "o", "9", "U", "a", "N", "x", "D", "X", "7", "z", "H", "y", "3", "e", "g", "T", "W", "b", "8", "k", "I", "p", "r"];

// Grab url to encoded string.
console.log('Extracting stepashka URL.');
st_equals = $('object').find('param[name="flashvars"]').val()
if (st_equals.indexOf('st=') == 0) {
  console.log('st= type.');
  // this is stequals type
  url = st_equals.substring(3);
  console.log('retrieving [' + url + ']');
  $.get(url, function(data) {
    json = JSON.parse(decodeUnobfuscated(data,
                                         stepashka_table1,
                                         stepashka_table2));
    data = {}
    if ('file' in json) {
      data = { type : 'single', files : [json.file] }
    } else if ('pl' in json) {
      json.pl = json.pl.replace(/'/g, '"');
      json = JSON.parse(json.pl);
      data = { type : 'multiple', files : [] }
      $.each(json.playlist, function(i, season) {
        $.each(season.playlist, function(i, episode) {
          data.files.push(episode.file)
        });
      });
    }
    chrome.extension.sendMessage(data);
  });
} else {
   // Is there a file equals type???
   console.log('Unknown param [' + st_equals + ']');
}
