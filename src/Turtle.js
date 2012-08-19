(function(global, undefined) {
	'use strict';

	// cached reference to ArchelonMath
	var ArchelonMath = global.Archelon.Math;

	// some useful constants
	var PI = Math.PI;
	var twoPI = 2 * PI;

	// default values
	var defaultX = 0;
	var defaultY = 0;
	var defaultHeading = 0;

	/**
	** @constructor
	** @param {global.Archelon.World} world the world that this turtle belogs to
	** @param {Number} id the unique id of this turtle in the given world
	**/
	var Turtle = global.Archelon.Turtle = function(world, id) {
		this.world = world;
		this.id = id;
		this.x = defaultX;
		this.y = defaultY;
		this._heading = defaultHeading;
	};

	/**
	** Return this turtle's heading in degrees
	** @return this turtle's heading in degrees
	**/
	Turtle.prototype.getHeading = function() {
		return ArchelonMath.rad2deg(this._heading);
	};

	/**
	** Return this turtle's heading in radians
	** @return this turtle's heading in radians
	**/
	Turtle.prototype.getHeadingRad = function() {
		return this._heading;
	};

	/**
	** Set this turtle's heading in degrees
	** @param {Number} this turtle's new heading, in degrees
	**/
	Turtle.prototype.setHeading = function(deg) {
		this._heading = ArchelonMath.deg2rad(deg > -180 && deg <= 180 ? deg : ((deg + 180) % 180) - 180);
	};

	/**
	** Set this turtle's heading in radians
	** @param {Number} this turtle's new heading, in radians
	**/
	Turtle.prototype.setHeadingRad = function(rad) {
		this._heading = rad > -PI && rad <= PI ? rad : ((rad + PI) % twoPI) - PI;
	};

	/**
	** Set this turtle's heading so that it faces the given entity
	** @param {Turtle} the entity to face
	**/
	Turtle.prototype.face = function(entity) {
		this._heading = ArchelonMath.angleTo(this.x, this.y, entity.x, entity.y);
	};
	
}((typeof exports === 'undefined') ? window : exports));