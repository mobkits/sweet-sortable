
build: components
	@component build --dev

components: component.json
	@component install

clean:
	@rm -rf build components

.PHONY: clean
