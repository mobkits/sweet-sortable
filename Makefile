dev:
	@webpack example/example.js example/bundle.js -w -d

doc:
	@webpack example/example.js example/bundle.js
	@rm -fr .gh-pages
	@mkdir .gh-pages
	@cp example/example.html .gh-pages/index.html
	@cp example/bundle.js .gh-pages
	@ghp-import .gh-pages -n -p
	@rm -fr .gh-pages

test:
	@webpack example/example.js example/bundle.js -w -d
	@open example.html

clean:
	rm -fr build components template.js

.PHONY: clean
