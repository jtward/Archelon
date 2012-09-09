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

	// default values
	var defaultX = 0;
	var defaultY = 0;
	var defaultHeading = 0;

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

	/**
	** The base class for all turtles.
	** @constructor
	**/
	var Turtle = global.Archelon._Turtle = function(){
		// no-op constructor
	};

	/**
	** Set this turtle's heading so that it faces the given entity
	** @param {Turtle} the entity to face
	**/
	Turtle.prototype.face = function(entity) {
		this._heading = ArchelonMath.angleTo(this.x, this.y, entity.x, entity.y);
	};
	
	/**
	** Move this turtle in the direction it is facing by the given distance
	** If the turtle would move outside the confines of the world, the turtle instead moves to the edge of the world
	** @param {Number} dist the distance to move
	**/
	Turtle.prototype.forward = function(dist) {
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
	Turtle.prototype.back = function(dist) {
		this.forward(-dist);
	};

	/**
	** Kill this turtle. After calling this method, this turtle will no longer be counted in the world's turtles.
	**/
	Turtle.prototype.die = function() {
		this.world._onTurtleDeath(this);
	};


	/**
	** Return the patch that this turtle is currently on.
	**/
	Turtle.prototype.patch = function() {
		return this.world._patches[(Math.floor(this.y) * this.world.width) + Math.floor(this.x)];
	};

	/**
	** The base class for turtles in worlds with RADIANS as the angular unit
	** @constructor
	**/
	var Turtle_rad = global.Archelon._Turtle_rad = function(world, id, x, y, heading) {
		this.world = world;
		this.id = id;
		this.x = x;
		this.y = y;
		this._heading = heading;
	};

	Turtle_rad.prototype = Object.create(Turtle.prototype);

	/**
	** Return this turtle's heading in radians
	** @return this turtle's heading in radians
	**/
	Turtle_rad.prototype.getHeading = function() {
		return this._heading;
	};
	
	/**
	** Set this turtle's heading in radians
	** @param {Number} this turtle's new heading, in radians
	**/
	Turtle_rad.prototype.setHeading = function(rad) {
		this._heading = wrapHeading(rad);
	};

	/**
	** Turn this turtle left by the given angle
	** @param {Number} rad the agnle to turn left, in radians
	**/
	Turtle_rad.prototype.left = function(rad) {
		this._heading = wrapHeading(this._heading + rad);
	};

	/**
	** Turn this turtle right by the given angle
	** @param {Number} rad the agnle to turn right, in radians
	**/
	Turtle_rad.prototype.right = function(rad) {
		this._heading = wrapHeading(this._heading - rad);
	};

	/**
	** Return the smallest angle through which this turtle could turn in order to face the given entity.
	** @param {Turtle} the entity to face.
	** @return {Number} the smallest angle through which this turtle could turn in order to face the given entity. Given in radians in the range [-PI, PI) with negative values indicating a right turn and positive values indicating a left turn.
	**/
	Turtle_rad.prototype.angleTo = function(entity) {
		var absAngle = ArchelonMath.angleTo(this.x, this.y, entity.x, entity.y);
		return angleTo(absAngle, this._heading);
	};
		
	var Turtle_deg = global.Archelon._Turtle_deg = function(world, id, x, y, heading) {
		this.world = world;
		this.id = id;
		this.x = x;
		this.y = y;
		// assume that heading is in the range [-180, 180)
		this._heading = ArchelonMath.deg2rad(heading);
	};

	Turtle_deg.prototype = Object.create(Turtle.prototype);

	/**
	** Return this turtle's heading in degrees
	** @return this turtle's heading in degrees
	**/
	Turtle_deg.prototype.getHeading = function() {
		return ArchelonMath.rad2deg(this._heading);
	};

	/**
	** Set this turtle's heading in degrees
	** @param {Number} this turtle's new heading, in degrees
	**/
	Turtle_deg.prototype.setHeading = function(deg) {
		this._heading = wrapHeading(ArchelonMath.deg2rad_fast(deg));
	};

	/**
	** Turn this turtle left by the given angle
	** @param {Number} rad the agnle to turn left, in degrees
	**/
	Turtle_deg.prototype.left = function(deg) {
		this._heading = wrapHeading(this._heading - ArchelonMath.deg2rad_fast(deg));
	};

	/**
	** Turn this turtle right by the given angle
	** @param {Number} rad the agnle to turn right, in degrees
	**/
	Turtle_deg.prototype.right = function(deg) {
		this._heading = wrapHeading(this._heading + ArchelonMath.deg2rad_fast(deg));
	};

	/**
	** Return the smallest angle through which this turtle could turn in order to face the given entity.
	** @param {Turtle} the entity to face.
	** @return {Number} the smallest angle through which this turtle could turn in order to face the given entity. Given in degrees in the range (-180, 180] with negative values indicating a left turn and positive values indicating a right turn.
	**/
	Turtle_deg.prototype.angleTo = function(entity) {
		var absAngle = ArchelonMath.angleTo(this.x, this.y, entity.x, entity.y);
		return ArchelonMath.rad2deg(angleTo(absAngle, this._heading));
	};
	
}((typeof exports === 'undefined') ? window : exports));