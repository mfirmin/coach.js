
SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

all: static/coach.js Makefile

clean: 
	rm coach.js

static/coach.js: $(SOURCES)
	browserify src/coach.js --s Coach > static/coach.js
