dev:
	@webpack example/example.js example/bundle.js -w -d

doc:
	@ghp-import example -n -p

test:
	@webpack example/example.js example/bundle.js -w -d
	@open example.html

clean:
	rm -fr build components template.js

.PHONY: clean
