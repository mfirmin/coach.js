
COACH = build/coach.js

SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

.PHONY: all clean build

all: $(COACH) Makefile

clean: 
	rm $(COACH)

build: $(COACH)

$(COACH): $(SOURCES)
	cd bin && node build-umd.js
	cp build/coach.js static/coach.js

watch: build
	watchman-make -p '$(SOURCEDIR)/**/*.js' -t build

run:
	bundle exec jekyll serve 
