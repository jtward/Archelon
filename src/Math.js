(function(global, undefined) {
	'use strict';

	var PI = Math.PI;
	var rad2degConst = -(180 / PI);
	var deg2radConst = -(PI / 180);
	var quarterRotationDeg = 90;
	var quarterRotationRad = PI / 2;
	var halfRotationDeg = 180;
	var halfRotationRad = PI;
	var fullRotationDeg = 360;
	var fullRotationRad = 2 * PI;

	var ArchelonMath = global.Archelon.Math = {};

	/**
	** Return the angle in degrees that is equivalent to the given angle in radians
	** @param {Number} rad an angle in radians in the range [-PI, PI)
	** @param {Number} the angle equivalent to the given angle in degrees in the range [-180, 180)
	**/
	ArchelonMath.rad2deg = function(rad) {
		var deg = rad * rad2degConst + quarterRotationDeg;
		return deg > halfRotationDeg ? deg - fullRotationDeg : deg;
	};

	/**
	** Return the angle in degrees that is equivalent to the given angle in radians
	** @param {Number} deg an angle in radians
	** @param {Number} the angle equivalent to the given angle in degrees
	**/
	ArchelonMath.rad2deg_fast = function(rad) {
		return rad * rad2degConst + quarterRotationDeg;
	};

	/**
	** Return the angle in radians that is equivalent to the given angle in degrees
	** @param {Number} deg an angle in degrees in the range [-180, 180)
	** @param {Number} the angle equivalent to the given angle in radians in the range [-PI, PI)
	**/
	ArchelonMath.deg2rad = function(deg) {
		var rad = deg * deg2radConst + quarterRotationRad;
		return rad <= -halfRotationRad ? rad + fullRotationRad : rad;
	};

	/**
	** Return the angle in radians that is equivalent to the given angle in degrees
	** @param {Number} deg an angle in degrees
	** @param {Number} the angle equivalent to the given angle in radians
	**/
	ArchelonMath.deg2rad_fast = function(deg) {
		return deg * deg2radConst + quarterRotationRad;
	};

	/**
	** Return the angle equivalent to the given angle in the range [-PI, PI)
	** @param {Number} rad an angle in radians
	** @return {Number} the angle equivalent to the given angle in the range [-PI, PI)
	**/
	ArchelonMath.wrapRad = function(rad) {
		return ((rad + halfRotationRad) % fullRotationRad) - halfRotationRad;
	};
	
	/**
	** Return the angle equivalent to the given angle in the range [-180, 180)
	** @param {Number} rad an angle in degrees
	** @return {Number} the angle equivalent to the given angle in the range [-180, 180)
	**/
	ArchelonMath.wrapDeg = function(deg) {
		return ((deg + halfRotationDeg) % fullRotationDeg) - halfRotationDeg;
	};

	/**
	** Return the bearing in radians from the point (x1, y1) to the point (x2, y2)
	** @param {Number} x1 the x-coordinate of the source point
	** @param {Number} y1 the y-coordinate of the source point
	** @param {Number} x2 the x-coordinate of the target point
	** @param {Number} y2 the y-coordinate of the target point
	** @return {Number} the bearing in radians from the point (x1, y1) to the point (x2, y2) in the range [-PI, PI)
	**/
	ArchelonMath.angleTo = function(x1, y1, x2, y2) {
		// y1 - y2 rather than y2 - y1 because the world is inverted in y
		// atan2 returns a value in the range (-PI, PI] so we must check for PI and reverse the sign
		var angle = Math.atan2(y1 - y2, x2 - x1);
		return angle === PI ? -angle : angle;
	};

	/**
	** Return the distance between the point (x1, y1) and the point (x2, y2)
	** @param {Number} x1 the x-coordinate of the source point
	** @param {Number} y1 the y-coordinate of the source point
	** @param {Number} x2 the x-coordinate of the target point
	** @param {Number} y2 the y-coordinate of the target point
	** @return {Number} the distance between the point (x1, y1) and the point (x2, y2)
	**/
	ArchelonMath.distanceTo = function(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	};



}((typeof exports === 'undefined') ? window : exports));