up:
	bundle exec jekyll serve --baseurl /roroad-trip

compress:
	$(if $(FILE),,$(error Please specify a file: make compress FILE=path/to/video.mov))
	ffmpeg -i "$(FILE)" -vcodec libx265 -crf 21 -pix_fmt yuv420p -tag:v hvc1 "$$(dirname "$(FILE)")/$$(basename "$(FILE)" | cut -f 1 -d '.').mp4"