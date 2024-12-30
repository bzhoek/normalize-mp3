const {exec} = require('child_process');

const file = process.argv[2]

exec(`ffmpeg -i "${file}" -hide_banner -loglevel info -nostats -filter:a loudnorm=print_format=json -f null /dev/null`, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
    return;
  }

  let capturing = false;
  let capture = []
  stderr.split(/\r?\n/).forEach(line => {
    if (capturing) {
      capture.push(line);
    }
    if (line.startsWith('[Parsed_loudnorm_0')) {
      capturing = true;
    }
    if (line === '}') {
      capturing = false;
    }
  });

  let loudnorm = JSON.parse(capture.join('\n'));
  console.log(loudnorm);
});