
SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

all: build/coach.js Makefile

clean: 
	rm build/coach.js

build/coach.js: $(SOURCES)
	browserify src/coach.js --s Coach > build/coach.js
