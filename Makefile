dev:
	@./node_modules/.bin/webpack example/example.js example/bundle.js -w -d

umd:
	@webpack lib/index.js build/sortable.js --output-library sortable --output-library-target umd
	@uglifyjs build/sortable.js > build/sortable.min.js

test:
	@open http://localhost:8080/bundle
	@webpack-dev-server 'mocha!./test/test.js' --inline --hot -d

test-karma:
	@node_modules/.bin/karma start --single-run

doc:
	@ghp-import example -n -p

test-coveralls:
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@node_modules/.bin/karma start --single-run && \
		cat ./coverage/lcov/lcov.info | ./node_modules/coveralls/bin/coveralls.js

.PHONY: clean doc test
