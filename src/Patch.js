(function(global, undefined) {
	'use strict';

	/**
	** Create a new Patch
	** @constructor
	**/

	var Patch = global.Archelon._Patch = function(world, x, y) {
		this.world = world;
		this.x = x;
		this.y = y;
	};

	/**
	** Initialize this patch
	** Creates the neighbours4 and neighbours8 arrays.
	**/
	Patch.prototype.init = function() {
		var neighbours4 = this.neighbours4 = [];
		var neighbours8 = this.neighbours8 = [];
		var x = this.x;
		var y = this.y;
		var worldWidth = this.world.width;
		var worldHeight = this.world.height;
		var patches = this.world._patches;
		var worldLength = patches.length;
		var left = x - 1;
		var top = (y - 1) * worldWidth;
		var right = x + 1;
		var bottom = (y + 1) * worldWidth;
		var patch;

		// all of the heights are premultiplied by the width, including y
		y *= worldWidth;
		
		if(left >= 0) {
			if(top >= 0) {
				neighbours8.push(patches[top + left]);
			}
			patch = patches[y + left];
			neighbours4.push(patch);
			neighbours8.push(patch);
			if(bottom < worldLength) {
				neighbours8.push(patches[bottom + left]);
			}
		}
		if(top >= 0) {
			patch = patches[top + x];
			neighbours4.push(patch);
			neighbours8.push(patch);
			if(right < worldWidth) {
				neighbours8.push(patches[top + right]);
			}
		}
		if(right < worldWidth) {
			patch = patches[y + right];
			neighbours4.push(patch);
			neighbours8.push(patch);
			if(bottom < worldLength) {
				neighbours8.push(patches[bottom + right]);
			}
		}
		if(bottom < worldLength) {
			patch = patches[bottom + x];
			neighbours4.push(patch);
			neighbours8.push(patch);
		}
	};

}((typeof exports === 'undefined') ? window : exports));