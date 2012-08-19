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

	ArchelonMath.rad2deg = function(rad) {
		var deg = rad * rad2degConst + quarterRotationDeg;
		return deg > halfRotationDeg ? deg - fullRotationDeg : deg;
	};

	ArchelonMath.deg2rad = function(deg) {
		var rad = deg * deg2radConst + quarterRotationRad;
		return rad <= -halfRotationRad ? rad + fullRotationRad : rad;
	};

	ArchelonMath.angleTo = function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
	};

}((typeof exports === 'undefined') ? window : exports));