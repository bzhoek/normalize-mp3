Two pass loudness normalization with ffmpeg. Alternative to [Python](https://github.com/slhck/ffmpeg-normalize).

```sh
node index.js <file.mp3>
```

The output is first saved to `file-normalized.mp3`, before the `file.mp3` is renamed to `file-original.mp3` to allow `file-normalized.mp3` to be renamed to `file.mp3`.

If `file-original.mp3` exists, it is used instead of `file.mp3` and `file.mp3` is deleted before `file-normalized.mp3` is renamed to `file.mp3`.

https://wiki.tnonline.net/w/Blog/Audio_normalization_with_FFmpeg