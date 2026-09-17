'use strict';

var core = require('@grudge-studio/core');
var assetResolver = require('@grudge-studio/asset-resolver');
var assets = require('@grudge-studio/assets');
var animator = require('@grudge-studio/animator');
var engine = require('@grudge-studio/engine');
var stack = require('@grudge-studio/stack');
var character = require('@grudge-studio/character');
var units = require('@grudge-studio/units');
var bake = require('@grudge-studio/bake');
var deploy = require('@grudge-studio/deploy');



Object.keys(core).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return core[k]; }
	});
});
Object.keys(assetResolver).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return assetResolver[k]; }
	});
});
Object.keys(assets).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return assets[k]; }
	});
});
Object.keys(animator).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return animator[k]; }
	});
});
Object.keys(engine).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return engine[k]; }
	});
});
Object.keys(stack).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return stack[k]; }
	});
});
Object.keys(character).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return character[k]; }
	});
});
Object.keys(units).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return units[k]; }
	});
});
Object.keys(bake).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return bake[k]; }
	});
});
Object.keys(deploy).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return deploy[k]; }
	});
});
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map