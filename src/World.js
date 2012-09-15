(function(global, undefined) {
	/*jshint devel:true*/
	'use strict';
	
	var Patch = global.Archelon.Patch;

	// set up the default options for the world constructor
	var defaultOptions = {
		// height and width are positive integers
		width: 10,
		height: 10,
		// defaultTurtleX/Y are positive numbers
		defaultTurtleX: 0,
		defaultTurtleY: 0,
		// defaultTurtleHeading is [-180, 180) for angularUnit DEGREE and [-PI, PI) for angularUnit RADIAN
		defaultTurtleHeading: 0,
		// angularUnit is one of the angular unit constants defined in the global Archelon object
		angularUnit: global.Archelon.DEFAULT_ANGULAR_UNIT
	};

	/**
	** Create a world.
	** @constructor
	**/
	var World = global.Archelon.World = function(options) {
		// set up instance variables
		// counter used to give each turtle a unique id
		this.__currentTurtleId = 0;
		var turtleSuperclass;
		// unique turtle subclass for this world. The superclass depends on the angular unit (see below)
		this._Turtle = function() {
			turtleSuperclass.apply(this, arguments);
		};
		// array containing all turtles, indexed by turtle id
		this._turtles = [];

		//set up the unique patch subclass for this world
		var patchSuperclass = global.Archelon._Patch;
		this._Patch = function() {
			patchSuperclass.apply(this, arguments);
		};

		// array containing all patches, a flattened 2d array. The patch at (x, y) is at index (y * width) + x
		this._patches = [];
		
		// normalize the options object by inserting the default values for options if they are not specified
		var option;
		if(typeof options === 'object') {
			for(option in defaultOptions) {
				if(!options.hasOwnProperty(option)) {
					options[option] = defaultOptions[option];
				}
			}
		}
		else {
			options = defaultOptions;
			// still validate just to be on the safe side
		}

		// validate options
		if(typeof options.width !== 'number' || Math.floor(options.width) !== options.width || options.width <= 0) {
			throw 'The width of the world must be a positive integer';
		}
		if(typeof options.height !== 'number' || Math.floor(options.height) !== options.height || options.height <= 0) {
			throw 'The height of the world must be a positive integer';
		}
		if(typeof options.defaultTurtleX !== 'number' || options.defaultTurtleX < 0 || options.defaultTurtleX >= options.width) {
			throw 'The default X position for turtles must be a number greater or equal to zero and less than the world\'s width';
		}
		if(typeof options.defaultTurtleY !== 'number' || options.defaultTurtleY < 0 || options.defaultTurtleY >= options.height) {
			throw 'The default Y position for turtles must be a number greater or equal to zero and less than the world\'s height';
		}
		if(typeof options.defaultTurtleHeading !== 'number') {
			throw 'The default heading for turtles must be a number';
		}
		if(typeof global.Archelon.ANGULAR_UNITS.indexOf(options.angularUnit) === -1) {
			throw 'The angular unit must be one of Archelon.DEGREE, Archelon.RADIAN';
		}

		// options are all valid
		// configure
		this.width = options.width;
		this.height = options.height;
		this.defaultTurtleX = options.defaultTurtleX;
		this.defaultTurtleY = options.defaultTurtleY;
		this.angularUnit = options.angularUnit;

		if(this.angularUnit === global.Archelon.RADIAN) {
			turtleSuperclass = global.Archelon._Turtle_rad;
			patchSuperclass = global.Archelon._Patch_rad;
			this.defaultTurtleHeading = global.Archelon.Math.wrapRad(options.defaultTurtleHeading);
		}
		else if(this.angularUnit === global.Archelon.DEGREE) {
			turtleSuperclass = global.Archelon._Turtle_deg;
			patchSuperclass = global.Archelon._Patch_deg;
			this.defaultTurtleHeading = global.Archelon.Math.wrapDeg(options.defaultTurtleHeading);
		}
		
		this._Turtle.prototype = Object.create(turtleSuperclass.prototype);
		this._Patch.prototype = Object.create(patchSuperclass.prototype);

		// _almostWidth/Height are used for determining the positions of turtles at the width or height of the world, which are not valid positions
		this._almostWidth = nextFloatDown(this.width);
		this._almostHeight = nextFloatDown(this.height);

		// create the world's patches, one for each unit square in the world. The patch at (x, y) is at index (y * width) + x
		var i = this.width, j, index, patch;
		while(i--) {
			j = this.height;
			while(j--) {
				this._patches[(j * this.width) + i] = new this._Patch(this, i, j);
			}
		}
		
		// initialize the world's patches - this sets up their neighbours array so we only ever calculate it once
		i = this.width;
		while(i--) {
			j = this.height;
			while(j--) {
				this._patches[(j * this.width) + i].init();
			}
		}
	};

	/**
	** Create a new turtle at the default position with the default heading
	**/
	World.prototype.createTurtle = function() {
		this._turtles.push(new this._Turtle(this, this.__currentTurtleId++, this.defaultTurtleX, this.defaultTurtleY, this.defaultTurtleHeading));
	};

	// Create a new breed
	// TODO: IMPLEMENT createBreed
	//World.prototype.createBreed = function(options) {};

	World.prototype._onTurtleDeath = function(turtle) {
		// deleting the element leaves a hole in the array. This means we can always use a turtle's id as an index into _turtles.
		delete this._turtles[turtle.id];
	};

	/**
	** Ask an array of entities to perform some action
	** The action may involve asking an array fo turtles to perform some action, in which case this function is recursive
	** @param {Entity[]} arr An array of entities to ask
	** @param {Function} fn The function which is executed in the context of each entity in the given array in turn. Its first argument is this.askStack, which must not me modified.
	** @param {Boolean?} dontClone A boolean which dictates whether a clone of the given array is made. If the value is not given or is falsy, the array is cloned to guard against modifications by the given function. If the given array is guaranteed never to be modified as a side-effect of the given function, then it is safe to set this value to true to improve performance.
	**/
	World.prototype.ask = function(arr, fn, dontClone) {
		var i = 0;
		var len = arr.length;
		var el;
		var stack = this.selfStack;

		arr = dontClone ? arr : arr.slice(0);

		for(i = 0; i < len; i += 1) {
			el = arr[i];
			stack.push(el);

			// fn may throw an error.
			try {
				// fn must not alter stack!
				fn.call(el, stack);
			} finally {
				// always pop
				stack.pop();
			}
		}
	};

	/**
	** Return the patch at the given x and y positions
	** @param {Number} x The x position
	** @param {Number} y The y position
	** @param {Patch} The patch at the given position, undefined if the given position is not contained in the world
	**/
	World.prototype.patchAtPosition = function(x, y) {
		return this._patches[Math.floor(y) * this.width + Math.floor(x)];
	};

	/**
	** Return the patch at the given x and y indices
	** @param {Number} x The x index
	** @param {Number} y The y index
	** @param {Patch} The patch at the given index, undefined if the given index is not contained in the world
	**/
	World.prototype.patchAtIndex = function(x, y) {
		return this._patches[y * this.width + x];
	};
	
	/**
	** Return the integer representation of the bits that make up the given number interpreted as an IEEE 754 single-precision floating-point number.
	** Taken from the update to Roland Illig's post on Stack Overflow at http://stackoverflow.com/questions/3077718/
	**/
	var floatToIntBits = function(f) {
		var NAN_BITS = 0|0x7FC00000;
		var INF_BITS = 0|0x7F800000;
		var ZERO_BITS = 0|0x00000000;
		var SIGN_MASK = 0|0x80000000;
		var EXP_MASK = 0|0x7F800000;
		var MANT_MASK = 0|0x007FFFFF;
		var MANT_MAX = Math.pow(2.0, 23) - 1.0;

		if (f != f) {
			return NAN_BITS;
		}
		var hasSign = f < 0.0 || (f === 0.0 && 1.0 / f < 0);
		var signBits = hasSign ? SIGN_MASK : 0;
		var fabs = Math.abs(f);

		if (fabs === Number.POSITIVE_INFINITY) {
			return signBits | INF_BITS;
		}

		var exp = 0, x = fabs;
		while (x >= 2.0 && exp <= 127) {
			exp++;
			x /= 2.0;
		}
		while (x < 1.0 && exp >= -126) {
			exp--;
			x *= 2.0;
		}

		var biasedExp = exp + 127;

		if (biasedExp === 255) {
			return signBits | INF_BITS;
		}
		var mantissa;
		if (biasedExp === 0) {
			mantissa = x * Math.pow(2.0, 23) / 2.0;
		} else {
			mantissa = x * Math.pow(2.0, 23) - Math.pow(2.0, 23);
		}

		var expBits = (biasedExp << 23) & EXP_MASK;
		var mantissaBits = mantissa & MANT_MASK;

		return signBits | expBits | mantissaBits;
	};

	/**
	** Return the IEEE 754 single-precision floating-point number whose bits when interpreted as an integer are equal to the given integer.
	**/
	var intBitsToFloat = function(bits) {
		var NAN_BITS = 0|0x7FC00000;
		var INF_BITS = 0|0x7F800000;
		var NEG_INF_BITS = -8388608;
		var SIGN_MASK = 0|0x80000000;
		var INVERSE_SIGN_MASK = 0|0x7FFFFFFFF;
		var EXP_MASK = 0|0x7F800000;
		var MANT_MASK = 0|0x007FFFFF;
		var MANT24_MASK = 0|0x00FFFFFF;
		var BIT24 = 0|0x800000;
		var negative;
		var mantissaBits;
		var exponentBits;
		var i;
		var mantissa;
		// check whether the sign bit set; if it is, the number is negative
		negative = (bits & SIGN_MASK) !== 0;
		// strip the sign bit if present
		bits &= INVERSE_SIGN_MASK;

		// check for NAN
		if(bits === NAN_BITS) {
			return NaN;
		}

		// check for infinities
		if(bits === INF_BITS) {
			return -Infinity;
		}
		if(bits === NEG_INF_BITS) {
			return Infinity;
		}

		// get just the bits from the mantissa
		mantissaBits = bits & MANT_MASK;
		// get just the bits from the exponent and shift down so the LSB is 1
		exponentBits = (bits & EXP_MASK) >> 23;
		// if the exponent bits not are all zero then add the implied bit to the mantissa
		if(exponentBits !== 0) {
			mantissaBits = mantissaBits | BIT24;
		}

		// compute the mantissa, which is the sum from 0 to 23 of 2^(-i) * mantissaBits[i]
		i = 0;
		mantissa = 0;
		while(mantissaBits) {
			if(BIT24 & mantissaBits) {
				mantissa += Math.pow(2, i);
			}
			i--;
			mantissaBits = (mantissaBits << 1) & MANT24_MASK;
		}

		// unbias the exponent by subtracting 127
		exponentBits = Math.pow(2.0, (exponentBits - 127));

		// return the result!
		if(negative) {
			return -mantissa * exponentBits;
		}
		else {
			return mantissa * exponentBits;
		}
	};

	// nextFloatUp and nextFloatDown are modified under the BSD licence from Tango contributors. The Tango BSD license is included under licenses/Tango BSD.
	// Source: http://tango.dsource.org/docs/current/tango.math.IEEE.html
	// Licensing: http://www.dsource.org/projects/tango/wiki/LibraryLicense
	/**
	** Return the smallest IEEE 754 single-precision floating-point number that is larger than the given number
	**/
	var nextFloatUp = function(x) {
		var INF_BITS = 0|0x7F800000;
		var NEG_INF_BITS = -8388608;
		var SIGN_MASK = 0|0x80000000;

		var ps = floatToIntBits(x);
		if((ps & INF_BITS) === INF_BITS) {
			if(ps === NEG_INF_BITS) {
				return -Number.MAX_VALUE;
			}
			return x;
		}
		if(ps & SIGN_MASK) {
			if(ps === SIGN_MASK) {
				return intBitsToFloat(0x1);
			}
			ps -= 1;
		}
		else {
			ps += 1;
		}
		return intBitsToFloat(ps);
	};

	/**
	** Return the largest IEEE 754 single-precision floating-point number that is smaller than the given number
	**/
	var nextFloatDown = function(x) {
		return -(nextFloatUp(-x));
	};
}((typeof exports === 'undefined') ? window : exports));