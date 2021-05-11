# Capture screen with ffmpeg

https://trac.ffmpeg.org/wiki/Capture/Desktop

## Windows

https://ffmpeg.org/ffmpeg-devices.html#gdigrab

### List devices

```bash
ffmpeg -list_devices true -f dshow -i dummy
```

### Fullscreen

```bash
ffmpeg -f gdigrab -framerate 30 -i desktop -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Specific area

```bash
ffmpeg -f gdigrab -framerate 30 -offset_x 10 -offset_y 20 -video_size 640x480 -i desktop -c:v libx264 -pix_fmt yuv420p output.mp4
```

### With audio

```bash
ffmpeg -f gdigrab -framerate 30 -i desktop -f dshow -i audio="Microphone Array (Realtek High Definition Audio(SST))" -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Hide mouse pointer

```bash
ffmpeg -f gdigrab -framerate 30 -draw_mouse 0 -i desktop -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Specific Window

It provides `title` option, but since mac dosn't support this. It would be better to implement manual selection & getting area rectangle.

## Mac

https://ffmpeg.org/ffmpeg-devices.html#avfoundation

### List devices

```bash
ffmpeg -f avfoundation -list_devices true -i ""
...
[AVFoundation indev @ 0x7f864ec303c0] AVFoundation video devices:
[AVFoundation indev @ 0x7f864ec303c0] [0] FaceTime HD Camera (Built-in)
[AVFoundation indev @ 0x7f864ec303c0] [1] Capture screen 0
[AVFoundation indev @ 0x7f864ec303c0] [2] Capture screen 1
[AVFoundation indev @ 0x7f864ec303c0] AVFoundation audio devices:
[AVFoundation indev @ 0x7f864ec303c0] [0] MacBook Pro Microphone
```

### Fullscreen

```bash
ffmpeg -f avfoundation -i "1:0" -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Specifc area

```bash
ffmpeg -f avfoundation -i "1:0" -vf "crop=640:480:200:200" -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Without audio

```bash
ffmpeg -f avfoundation -i "1:none" -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Hide mouse pointer

hidden by default
