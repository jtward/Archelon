(function(global, undefined) {
	'use strict';

	/**
	** Create a new Patch
	** @constructor
	**/
	global.Archelon._Patch = function(world, x, y) {
		this.world = world;
		this.x = x;
		this.y = y;
	};
}((typeof exports === 'undefined') ? window : exports));