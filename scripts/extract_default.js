console.log('Looking for plain links.');

has_anything = false;
data = {type: 'multiple', files : [] }
$("a").each(function(idx, elem){
  link = $(this).get(0).href;
  if (link.match(/.*(mkv|webp|mp4)$/g)) {
    console.log('Playable content parsed ' + link);
    data.files.push(link);
    has_anything = true;
  }
});

if (has_anything) {
  chrome.extension.sendMessage(data);
}
