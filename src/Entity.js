(function(global, undefined) {
	'use strict';

	// cached reference to ArchelonMath
	var ArchelonMath = global.Archelon.Math;

	// some useful constants
	var PI = Math.PI;
	var negPI = -PI;
	var twoPI = 2 * PI;
	var threePI = 3 * PI;
	var _180 = 180;
	var neg180 = -180;
	var _360 = 360;
	var root2 = Math.sqrt(2);

	// default values
	var defaultX = 0;
	var defaultY = 0;
	var defaultHeading = 0;

	var mix = function(target, mixin) {
		var prop;
		for (prop in mixin) {
			if(mixin.hasOwnProperty(prop)) {
				target[prop] = mixin[prop];
			}
		}
		return target;
	};

	/**
	** Wrap the given angle, given in radians, to [-PI, PI)
	** @param {Number} rad The angle to wrap in radians
	** @return {Number} the angle in [-PI, PI) equivalent to the given angle
	**/
	var wrapHeading = function(rad) {
		return rad >= negPI && rad < PI ? rad : ((rad + PI) % twoPI) - PI;
	};

	/**
	** Return the minimum angle through which to turn from currentHeading to absAngle
	** @param {Number} absAngle The heading, in radians, after turning by the returned amount
	** @param {Number} currentHeading The current heading, in radians
	** @return {Number} The angle, in radians, to turn from the current heading to the desired heading, in the range [-PI, PI)
	**/
	var angleTo = function(absAngle, currentHeading) {
		// acknowledgements for the following solution to angle_diff go to Samuel Tardieu, Benjamin Newman, Greg Rosenblatt, and James Hague
		// http://prog21.dadgum.com/96.html
		return (absAngle - currentHeading + threePI) % twoPI - PI;
	};


	var entity = {};

	entity.distanceTo = function(other) {
		var dx = this.x - other.x;
		var dy = this.y - other.y;
		return Math.sqrt(dx * dx + dy + dy);
	};

	entity.distanceSquaredTo = function(other) {
		var dx = this.x - other.x;
		var dy = this.y - other.y;
		return dx * dx + dy * dy;
	};

	entity.inRadius = function(arr, r) {
		var i, len = arr.length;
		var result = [];
		var distanceSquared = r * r;
		var other;
		for(i = 0; i < len; i += 1) {
			other = arr[i];
			if(this.distanceSquaredTo(other) <= distanceSquared) {
				result.push(other);
			}
		}
		return result;
	};

	entity.patchesInSquare = function(r) {
		var result = [];
		var worldWidth = this.world.width;
		var x = this.x;
		var y = this.y;
		var minX = Math.max(0, Math.floor(x - r));
		var maxX = Math.min(worldWidth, Math.ceil(x + r));
		var minY = Math.max(0, Math.floor(y - r)) * worldWidth;
		var maxY = worldWidth * Math.min(this.world.height, Math.ceil(y + r));
		var patches = this.world._patches;
		var i;
		var j;

		for(i = minY; i < maxY; i += worldWidth) {
			for(j = minX; j < maxX; j += 1) {
				result.push(patches[i + j]);
			}
		}
		if(result.length === 0) {
			result.push(patches[ minx + miny ]);
		}
		return result;
	};

	entity.patchesInRadius = function(r) {
		var patches = this.world._patches;
		var x = this.x;
		var floorx = Math.floor(x);
		var y = this.y;
		var floory = Math.floor(y);
		var rsquared = r * r;
		var worldWidth = this.world.width;
		var worldHeight = this.world.height;
		var result = []; //this.patchesInSquare(Math.max(r - root2, 0));

		var xcmin = Math.max(0, Math.floor(x - r));
		// NOT Math.floor(x + r + 1) because if Math.floor(x + r + 1) === x + r + 1 then 
		// the column x + r is not counted
		var xcmax = Math.min(worldWidth, Math.ceil(x + r));
		var ycmin = Math.max(0, Math.floor(y - r));
		var ycmax = Math.min(worldHeight, Math.ceil(y + r)); // NOT Math.floor(y + r) (see above)
		var xc;
		var yc;
		var ycWidth;
		var xcSquared;
		var ycSquared;
		for(xc = xcmin; xc < xcmax; xc += 1) {
			for(yc = ycmin; yc < ycmax; yc += 1) {
				// test the whether corner of the patch at (xc, yc) closest to this entity is in 
				// the circle
				ycWidth = yc * worldWidth;
				// gets a little tricky to tell which corner is closest if the x or y
				// coordinate of the test patch is equal to the x or y coordinate of the 
				// source patch
				xcSquared = x -
								(xc +
									((xc === floorx) ?
										(Math.abs(xc - x) < 0.5 ? 0 : 1) :
										((xc < x) ? 1 : 0)));
				
				xcSquared *= xcSquared;
				ycSquared = y -
								(yc +
									((yc === floory) ?
										(Math.abs(yc - y) < 0.5 ? 0 : 1) :
										((yc < y) ? 1 : 0)));

				ycSquared *= ycSquared;

				if(xcSquared + ycSquared < rsquared) {
					result.push(patches[ycWidth + xc]);
				}
			}
		}

		//special cases for patches with no corners in the circle
		// the first of these is the patch containing this entity
		if(result.length === 0) {
			result.push(patches[(floory * worldWidth) + floorx]);
		}

		//left side of the circle
		// guard against xcmin being limited by the world width
		// and being the patch containing this entity
		if(xcmin === Math.floor(x - r) && xcmin < floorx) {
			// start by testing bottom-right corner
			yc = y - (floory + 1);
			ycSquared = yc * yc;
			// we're testing the right edge of the patch so add 1 to xcmin
			xcSquared = x - (xcmin + 1);
			xcSquared *= xcSquared;

			// test whether the corner is in the circle using pythagoras
			if(xcSquared + ycSquared >= rsquared) {
				// the corner was not in the circle; now test the top-right corner
				yc = y - floory;
				ycSquared = yc * yc;

				if(xcSquared + ycSquared >= rsquared) {	
					// neither corner was in the circle so this patch is not currently in results
					result.push(patches[ (floory * worldWidth) + xcmin ]);
				}
			}
		}

		// top side of the circle
		if(ycmin === Math.floor(y - r) && ycmin < floory) {
			xc = x - (floorx + 1);
			xcSquared = xc * xc;
			ycSquared = y - (ycmin + 1);
			ycSquared *= ycSquared;

			if(xcSquared + ycSquared >= rsquared) {
				xc = x - floorx;
				xcSquared = xc * xc;
				if(xcSquared + ycSquared >= rsquared) {
					result.push(patches[ (ycmin * worldWidth) + floorx ]);
				}
			}
		}

		// right side of the circle
		if(xcmax === Math.ceil(x + r) && xcmax > floorx + 1) {
			// start by testing the bottom-left corner
			yc = y - (floory + 1);
			ycSquared = yc * yc;
			// we're testing the left edge of the patch so subtract 1 from xcmin
			xcSquared = xcmax - 1 - x;
			xcSquared *= xcSquared;
			
			if(xcSquared + ycSquared >= rsquared) {
				// now test the top-left corner
				yc = y - floory;
				ycSquared = yc * yc;
				if(xcSquared + ycSquared >= rsquared) {
					result.push(patches[ (floory * worldWidth) + xcmax - 1 ]);
				}
			}
		}

		if(ycmax === Math.ceil(y + r) && ycmax > floory + 1) {
			// start by testing the top-right corner
			xc = x - (floorx + 1);
			xcSquared = xc * xc;
			ycSquared = ycmax - 1- y;
			ycSquared *= ycSquared;

			if(xcSquared + ycSquared >= rsquared) {
				// now test the top-left corner
				xc = x - floorx;
				xcSquared = xc * xc;
				if(xcSquared + ycSquared >= rsquared) {
					result.push(patches[ ((ycmax - 1) * worldWidth) + floorx ]);
				}
			}
		}
		return result;
	};

	var entity_rad = mix({}, entity);

	/**
	** Return the smallest angle through which this turtle could turn in order to face the given entity.
	** @param {Turtle} other the entity to face.
	** @return {Number} the smallest angle through which this turtle could turn in order to face the given entity. Given in radians in the range [-PI, PI) with negative values indicating a right turn and positive values indicating a left turn.
	**/
	entity_rad.angleTo = function(other) {
		var absAngle = ArchelonMath.angleTo(this.x, this.y, other.x, other.y);
		return angleTo(absAngle, this._heading);
	};

	var entity_deg = mix({}, entity);

	/**
	** Return the smallest angle through which this turtle could turn in order to face the given entity.
	** @param {Turtle} other the entity to face.
	** @return {Number} the smallest angle through which this turtle could turn in order to face the given entity. Given in degrees in the range (-180, 180] with negative values indicating a left turn and positive values indicating a right turn.
	**/
	entity_deg.angleTo = function(other) {
		var absAngle = ArchelonMath.angleTo(this.x, this.y, other.x, other.y);
		return ArchelonMath.rad2deg(angleTo(absAngle, this._heading));
	};

	var turtle = {};

	/**
	** Set this turtle's heading so that it faces the given entity
	** @param {entity} other the entity to face
	**/
	turtle.face = function(other) {
		this._heading = ArchelonMath.angleTo(this.x, this.y, other.x, other.y);
	};

	/**
	** Move this turtle in the direction it is facing by the given distance
	** If the turtle would move outside the confines of the world, the turtle instead moves to the edge of the world
	** @param {Number} dist the distance to move
	**/
	turtle.forward = function(dist) {
		var x = this.x + (Math.cos(-this._heading) * dist);
		var y = this.y + (Math.sin(-this._heading) * dist);
		var m;
		var c;
		var wh;
		var ww;
		var ah;
		var aw;
		if(x < 0) {
			// dividing by (x - this.x) is ok here: x < 0 && this.x >= 0 so (x - this.x !== 0)
			m = (y - this.y) / (x - this.x);
			c = this.y - (m * this.x);
			wh = this.world.height;
			if(y < 0) {
				// could cross the top or left border of the world
				if(c < 0) { // then we know that the intersection is at (-c/m, 0)
					this.x = -c / m;
					this.y = 0;
				}
				else { // we know that the intersection is at (0, c)
					this.x = 0;
					this.y = c;
				}
			}
			else if(y > wh) {
				// could cross the bottom or left border of the world
				if(c > wh) {  // then we know that the intersection is at (-c/m, this.world.height)
					this.x = -c / m;
					this.y = this.world._almostHeight;
				}
				else { // we know that the intersection is at (0, c)
					this.x = 0;
					this.y = c;
				}
			}
			else {
				// we know that the intersection is at (0, c)
				this.x = 0;
				this.y = c;
			}
		}
		else if(x > this.world.width) {
			// dividing by (x - this.x) is ok here: x < 0 && this.x >= 0 so (x - this.x !== 0)
			m = (y - this.y) / (x - this.x);
			c = this.y - (m * this.x);
			wh = this.world.height;
			ww = this.world.width;
			if(y < 0) {
				// could cross the top or right border of the world
				if(c < 0) { // then we know that the intersection is at (-c/m, 0)
					this.x = -c / m;
					this.y = 0;
				}
				else { // we know that the intersection is at (ww, c)
					this.x = this.world._almostWidth;
					this.y = c;
				}
			}
			else if(y > wh) {
				// could cross the bottom or left border of the world
				if(c > wh) {  // then we know that the intersection is at (-c/m, this.world.height)
					this.x = -c / m;
					this.y = this.world._almostHeight;
				}
				else { // we know that the intersection is at (ww, c)
					this.x = this.world._almostWidth;
					this.y = c;
				}
			}
			else {
				// we know that the intersection is at (ww, c)
				this.x = this.world._almostWidth;
				this.y = c;
			}
		}
		else if(y < 0) {
			if(x - this.x !== 0) {
				m = (y - this.y) / (x - this.x);
				c = this.y - (m * this.x);
				ww = this.world.width;
				if(x < 0) {
					// could cross the top or left border of the world
					if(c < 0) { // then we know that the intersection is at (-c/m, 0)
						this.x = -c / m;
						this.y = 0;
					}
					else { // we know that the intersection is at (0, c)
						this.x = 0;
						this.y = c;
					}
				}
				else if(x > ww) {
					// could cross the top or right border of the world
					// clobber x since we don't need it any more
					x = -c / m;
					if(x > ww) { // then we know that the intersection is at (this.world.width, m * this.world.width + c)
						this.x = this.world._almostWidth;
						this.y = m * ww + c;
					}
					else { // we know that the intersection is at (-c / m, 0)
						this.x = x;
						this.y = 0;
					}
				}
				else {
					//we know that the intersection is at (-c / m, 0)
					this.x = -c / m;
					this.y = 0;
				}
			}
			else {
				// vertical line crossing the top border of the world
				this.y = 0;
			}
		}
		else if(y > this.world.height) {
			if(x - this.x !== 0) {
				m = (y - this.y) / (x - this.x);
				c = this.y - (m * this.x);
				wh = this.world.height;
				ww = this.world.width;

				if(x < 0) {
					// could cross the bottom or left border of the world
					if(c > wh) { // then we know that the intersection is at (-c/m, wh)
						this.x = -c / m;
						this.y = this.world._almostHeight;
					}
					else { // we know that the intersection is at (0, c)
						this.x = 0;
						this.y = c;
					}
				}
				else if(x > ww) {
					// could cross the bottom or right border of the world
					// clobber x since we don't need it any more
					x = -c / m;
					if(x > ww) { // then we know that the intersection is at (this.world.width, m * this.world.width + c)
						this.x = this.world._almostWidth;
						this.y = m * ww + c;
					}
					else {  // we know that the intersection is at (-c / m, wh)
						this.x = x;
						this.y = this.world._almostHeight;
					}
				}
				else {
					//we know that the intersection is at (-c / m, wh)
					this.x = -c / m;
					this.y = this.world._almostHeight;
				}
			}
			else {
				// vertical line crossing the bottom border of the world
				this.y = this.world._almostHeight;
			}
		}
		else {
			// couldn't find anything wrong; move the full whack.
			this.x = x;
			this.y = y;
		}
	};

	/**
	** Move the turtle by the given distance in the opposite direction to its heading.
	** @param {Number} dist The distance to move
	**/
	turtle.back = function(dist) {
		this.forward(-dist);
	};

	/**
	** Kill this turtle. After calling this method, this turtle will no longer be counted in the world's turtles.
	**/
	turtle.die = function() {
		this.world._onTurtleDeath(this);
	};

	/**
	** Return the patch that this turtle is currently on.
	**/
	turtle.patch = function() {
		return this.world._patches[(Math.floor(this.y) * this.world.width) + Math.floor(this.x)];
	};

	
	var turtle_rad = mix({}, turtle);

	/**
	** Return this turtle's heading in radians
	** @return this turtle's heading in radians
	**/
	turtle_rad.getHeading = function() {
		return this._heading;
	};

	/**
	** Set this turtle's heading in radians
	** @param {Number} this turtle's new heading, in radians
	**/
	turtle_rad.setHeading = function(rad) {
		this._heading = wrapHeading(rad);
	};

	/**
	** Turn this turtle left by the given angle
	** @param {Number} rad the agnle to turn left, in radians
	**/
	turtle_rad.left = function(rad) {
		this._heading = wrapHeading(this._heading + rad);
	};

	/**
	** Turn this turtle right by the given angle
	** @param {Number} rad the agnle to turn right, in radians
	**/
	turtle_rad.right = function(rad) {
		this._heading = wrapHeading(this._heading - rad);
	};

	var Turtle_rad = global.Archelon._Turtle_rad = function(world, id, x, y, heading) {
		this.world = world;
		this.id = id;
		this.x = x;
		this.y = y;
		this._heading = heading;
	};

	Turtle_rad.prototype = mix(mix({}, entity_rad), turtle_rad);

	var turtle_deg = mix({}, turtle);

	/**
	** Return this turtle's heading in degrees
	** @return this turtle's heading in degrees
	**/
	turtle_deg.getHeading = function() {
		return ArchelonMath.rad2deg(this._heading);
	};

	/**
	** Set this turtle's heading in degrees
	** @param {Number} this turtle's new heading, in degrees
	**/
	turtle_deg.setHeading = function(deg) {
		this._heading = wrapHeading(ArchelonMath.deg2rad_fast(deg));
	};

	/**
	** Turn this turtle left by the given angle
	** @param {Number} rad the agnle to turn left, in degrees
	**/
	turtle_deg.left = function(deg) {
		this._heading = wrapHeading(this._heading - ArchelonMath.deg2rad_fast(deg));
	};

	/**
	** Turn this turtle right by the given angle
	** @param {Number} rad the agnle to turn right, in degrees
	**/
	turtle_deg.right = function(deg) {
		this._heading = wrapHeading(this._heading + ArchelonMath.deg2rad_fast(deg));
	};

	var Turtle_deg = global.Archelon._Turtle_deg = function(world, id, x, y, heading) {
		this.world = world;
		this.id = id;
		this.x = x;
		this.y = y;
		// assume that heading is in the range [-180, 180)
		this._heading = ArchelonMath.deg2rad(heading);
	};

	Turtle_deg.prototype = mix(mix({}, entity_deg), turtle_deg);

	var patch = {};

	patch.init = function() {
		var neighbours4 = this.neighbours4 = [];
		var neighbours8 = this.neighbours8 = [];
		var x = this.indexX;
		var y = this.indexY;
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
	
	var patch_rad = mix({}, patch);
	var patch_deg = mix({}, patch);

	var Patch_rad = global.Archelon._Patch_rad = function(world, x, y) {
		this.world = world;
		this.indexX = x;
		this.indexY = y;
		this.x = x + 0.5;
		this.y = y + 0.5;
	};

	Patch_rad.prototype = mix(mix({}, entity_rad), patch_rad);

	var Patch_deg = global.Archelon._Patch_deg = function(world, x, y) {
		this.world = world;
		this.indexX = x;
		this.indexY = y;
		this.x = x + 0.5;
		this.y = y + 0.5;
	};

	Patch_deg.prototype = mix(mix({}, entity_deg), patch_deg);	

}((typeof exports === 'undefined') ? window : exports));