const axios = require('axios');
const prompt = require("prompt-sync")({ sigint: true });
var url = prompt('Cf ray Id: ');

/**
 * - Extract the Challenge endpoint code.
 * - Extract the LZ Alphabet string (65 chars).
 */
axios
  .get('https://innvictus.com/cdn-cgi/challenge-platform/h/b/orchestrate/managed/v1?ray=' + url)
  .then(res => {
    console.log(`statusCode: ${res.status}`);
    console.log();
    console.log(res.data.match(/0\.[^('|/)]+/)[0]);
    console.log()
    console.log(res.data.match(/[\W]?([A-Za-z0-9+\-$]{65})[\W]/)[1]);
  })
  .catch(error => {
    console.error(error);
  });