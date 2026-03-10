up:
	bundle exec jekyll serve --baseurl /roroad-trip

compress:
	@if [ -z "$(PATH)" ]; then \
		echo "Error: PATH not set. Usage: make compress PATH=path/to/image.jpg QUALITY=20"; \
		exit 1; \
	fi
	@if [ -z "$(QUALITY)" ]; then \
		echo "Error: QUALITY not set. Usage: make compress PATH=path/to/image.jpg QUALITY=20"; \
		exit 1; \
	fi
	@. ~/.bashrc && magick "$(PATH)" -quality $(QUALITY) "$(PATH)"