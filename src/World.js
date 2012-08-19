(function(global, undefined) {
	'use strict';
	
	var Patch = global.Archelon.Patch;
	var Turtle = global.Archelon.Turtle;
	delete global.Archelon.Patch;

	var defaultOptions = {
		width: 10,
		height: 10
	};

	global.Archelon.World = function(options) {
		// set up instance variables
		this.__currentTurtleId = 0;
		this._defaultTurtleHeading = Math.PI / 2;
		this._defaultTurtleX = 0;
		this._defaultTurtleY = 0;

		options = options || defaultOptions;
		if(typeof options.width !== 'number' || Math.floor(options.width) !== options.width || options.width <= 0) {
			throw 'The world\'s width must be a positive integer';
		}
		if(typeof options.height !== 'number' || Math.floor(options.height) !== options.height || options.height <= 0) {
			throw 'The world\'s height must be a positive integer';
		}
		this.width = options.width;
		this.height = options.height;


		// cover the world in patches
		this._patches = [];

		var i = this.width, j = this.height;
		while(i--) {
			while(j--) {
				this._patches[(j * this.width) + i] = new Patch(this, i, j);
			}
		}
		
		// create a turtle container
		this._turtles = [];
	};


	global.Archelon.World.prototype.createTurtle = function() {
		this._turtles.push(new Turtle(this, this.__currentTurtleId++));
	};
}((typeof exports === 'undefined') ? window : exports));