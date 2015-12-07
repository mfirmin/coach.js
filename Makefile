
SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

all: coach.js Makefile

clean: 
	rm coach.js

coach.js: $(SOURCES)
	browserify src/coach.js --s Coach > coach.js
