// Decode uppod encrypted strings given the substitution table.

// Plain substituted string. Ouptut is usually url or json file.
function decodeUnobfuscated(url, table1, table2) {
  output = '';
  for(i = 0; i < url.length; i++){
    if (table1.indexOf(url[i]) != -1) {
      output += table2[table1.indexOf(url[i])]
    } else if (table2.indexOf(url[i]) != -1) {
      output += table1[table2.indexOf(url[i])]
    } else {
      output += url[i]
    }
  }
  return window.atob(output);
}
