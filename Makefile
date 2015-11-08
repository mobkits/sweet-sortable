dev:
	@webpack example/example.js example/bundle.js -w -d

umd:
	@webpack index.js build/sortable.js --output-library sortable --output-library-target umd
	@uglifyjs build/sortable.js > build/sortable.min.js

doc:
	@ghp-import example -n -p

test:
	@open example/index.html
	@webpack example/example.js example/bundle.js -w -d

clean:
	rm -fr build components template.js

.PHONY: clean
