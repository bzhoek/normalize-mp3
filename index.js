const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');

const filePath = process.argv[2]

function writeToFile(filePath, loudness, json) {
  const dirname = path.dirname(filePath);
  const extension = path.extname(filePath);
  const basename = path.basename(filePath, extension);
  const normalized = path.join(dirname, `${basename}-loudnorm${extension}`);
  const original = path.join(dirname, `${basename}-original${extension}`);

  let input = filePath;
  if (fs.existsSync(original)) {
    console.log("Using original backup", original);
    input = original;
  }
  const loudnorm = `loudnorm=linear=true:i=${loudness}:measured_I=${json.input_i}:measured_tp=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}`
  console.log(input, normalized, loudnorm)

  let command = `ffmpeg -y -i "${input}" -hide_banner -loglevel info -nostats -filter:a ${loudnorm} "${normalized}"`;
  console.log(command)
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return;
    }
    if (fs.existsSync(original)) {
      console.log("Removing normalized", filePath);
      fs.unlinkSync(filePath);
    } else {
      fs.renameSync(filePath, original);
    }
    fs.renameSync(normalized, filePath);

    console.log(stdout)
    console.log(stderr)
  });
}

function getLoudnessJson(file) {
  return new Promise((resolve) => {
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
      resolve(loudnorm);
    });
  })
}

const target = -20;
getLoudnessJson(filePath)
  .then((json) => {
    const delta = Math.abs(target - json.input_i);
    if (delta > 8.0) {
      console.log(delta, json);
      writeToFile(filePath, target, json);
    }
  });