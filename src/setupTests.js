import '@testing-library/jest-dom'

if (!Element.prototype.scrollIntoView) {
	// jsdom does not implement scroll APIs by default; provide a safe no-op.
	Element.prototype.scrollIntoView = () => {};
}
