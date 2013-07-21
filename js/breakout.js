
if (!Function.prototype.bind) {
	Function.prototype.bind = function(thisObj) {
		var fn = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return fn.apply(thisObj, args.concat(Array.prototype.slice.call(arguments)));
		}
	}
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

Math.randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	return rand
}

COLLISIONS = {
	0 : 'bodyTop',
	1 : 'bodyBottom',
	2 : 'bodyLeft',
	3 : 'bodyRight'
};

var Breakout = function(container, debug){
	this.debug = debug || false;
	if(!!this.debug){
		this.Stats = new Stats();
	    this.Stats.getDomElement().style.position = 'absolute';
	    this.Stats.getDomElement().style.left = '0px';
	    this.Stats.getDomElement().style.top = '0px';
	    document.body.appendChild( this.Stats.getDomElement() );
	}

	this.dom = {};
	//this.ec = [];
	this._startTime = new Date().getTime();

	this.dom.root = document.getElementById(container);

	this._prepareConfig();
	this._makeGrid();
	this._makePlayer();
	this._makeBall();

	this._build();
	this._link();
};

Breakout.prototype.addListener = function(elm, type, action){
	if(document.addEventListener){
		elm.addEventListener(type, action);
	} else if(document.attachEvent){
		elm.attachEvent('on'+type, action);
	} else {
		throw new Error("This browser can not handle events");
	}
};

Breakout.prototype.angleToRad = function(angle){
	var rad = Math.PI*angle/180;
	return rad;
};

Breakout.prototype.radToAngle = function(rad){
	var angle = rad*180/Math.PI;
	return angle;
};

Breakout.prototype._cancelDef = function(e){
	var e = e || window.event;
	if(e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
};

Breakout.prototype._prepareConfig = function(){
	this._bodySize();
	this.config = {
		grid : {
			w : 0,
			h : 0
		}
	};
	this.config.gridItem = {
		w : this.bodySize.w / this.config.grid.w,
		h : this.bodySize.h / this.config.grid.w
	};
};

Breakout.prototype._bodySize = function(){
	if(!this.bodySize){
		var w = document.body.clientWidth;
		var h = window.innerHeight;

		//var w = 500;
		//var h = 300;

		this.bodySize = {
			w : w-22,
			h : h-22
		};
	}
	return this.bodySize;
};

Breakout.prototype._makeGrid = function(){
	this.grid = [];
	for(var i=0;i<this.config.grid.h;i++){
		g = [];
		for(var j=0;j<this.config.grid.w;j++){
			var obj = {
				visible : true,
				color : 'rgb('+Math.randRange(0,255)+','+Math.randRange(0,255)+','+Math.randRange(0,255)+')'
			}
			g.push(obj);
		}
		this.grid.push(g);
	}
};

Breakout.prototype._makePlayer = function(){
	this.player = {
		//w : this.config.gridItem.w * 2,
		w : 100,
		//h : this.config.gridItem.h,
		h : 10,
		color : 'rgb(255,0,255)'
	};
	this.player.pos = {
		x : (this.bodySize.w / 2) - (this.player.w / 2),
		y : this.bodySize.h - (this.player.h * 2)
	};
};

Breakout.prototype._makeBall = function(){
	this.ball = {
		r : 10,
		w : 10,
		h : 10,
		speed : 200,
		angle : this.angleToRad(45*5)
	};
	this.ball.pos = {
		x : this.player.pos.x + this.player.w / 2,
		y : this.player.pos.y-this.ball.h
	};
};

Breakout.prototype._build = function(){
	var bodySize = this._bodySize();

	// canvas element
	this.dom.canvas = document.createElement('canvas');
	this.dom.canvas.width = bodySize.w;
	this.dom.canvas.height = bodySize.h;

	// canvas context
	this.canvas = this.dom.canvas.getContext('2d');

	// canvas append
	this.dom.root.appendChild(this.dom.canvas);
	this._buildGrid();
	this._buildPlayer();
	this._buildBall();

	this._start();
};

Breakout.prototype._start = function(){
	requestAnimFrame(this._tick.bind(this));
	this._ballLaunch();
};

Breakout.prototype._ballLaunch = function(){

};

Breakout.prototype._tick = function(){
	this._update();
	this._draw();
	requestAnimFrame(this._tick.bind(this));
};

Breakout.prototype._buildGrid = function(){
	this.canvas.save();
	this.canvas.strokeStyle = 'rgb(0,0,0)';
	for(var i=0;i<this.grid.length;i++){
		for(var j=0;j<this.grid[i].length;j++){
			var item = this.grid[i][j];
			if(!!item.visible){
				var size = {
					w : this.config.gridItem.w,
					h : this.config.gridItem.h
				};
				var pos = {
					x : j*size.w,
					y : i*size.h
				};
				this.canvas.fillStyle = item.color;
				this.canvas.strokeRect(pos.x, pos.y, size.w, size.h);
				this.canvas.fillRect(pos.x, pos.y, size.w, size.h);
			}
		}
	}
	this.canvas.restore();
};

Breakout.prototype._buildPlayer = function(){
	this.canvas.save();
	this.fillStyle = this.player.color;
	this.strokeStyle = 'rgb(0,0,0)';
	var pos = {
		x : this.player.pos.x - this.player.w,
		y : this.player.pos.y
	};
	this.canvas.fillRect(pos.x, pos.y, this.player.w, this.player.h);
	this.canvas.strokeRect(pos.x, pos.y, this.player.w, this.player.h);
	this.canvas.restore();
};

Breakout.prototype._buildBall = function(){
	this.canvas.save();
	this.canvas.beginPath();

	this.canvas.fillStyle = 'rgb(255,0,0)';
	this.canvas.arc(this.ball.pos.x, this.ball.pos.y, this.ball.r, 0, 6.28, false);
	this.canvas.fill();
	this.canvas.stroke();

	this.canvas.closePath();
	this.canvas.restore();
};

Breakout.prototype._update = function(){
	if(!!this.debug){
		this.Stats.update();
	}
	this._ballUpdate();
};

Breakout.prototype._draw = function(){
	this._clearCanvas();
	this._buildGrid();
	this._buildPlayer();
	this._buildBall();
};

Breakout.prototype._ballUpdate = function(){
	var collision = this._ballCollision();
	this._ballMove(collision);
};

Breakout.prototype._getGridCoords = function(pos){
	var maxHeight = this.config.gridItem.h * this.config.grid.h;
	var coords = null;
	if(pos.y <= maxHeight && pos.y >= 0 && pos.x >= 0 && pos.x <= this.bodySize.w){
		coords = {};
		coords.x = Math.floor(pos.x / this.config.gridItem.w);
		coords.y = Math.floor(pos.y / this.config.gridItem.h);
	}
	return coords;
};

Breakout.prototype._ballCollision = function(){
	var collision = null;
	var p = {
		x : this.ball.pos.x,
		y : this.ball.pos.y
	};

	// body
	if(p.x >= this.bodySize.w || p.x <= 0 || p.y >= this.bodySize.h || p.y <= 0){
		collision = true;
	}

	var gCoords = this._getGridCoords(p);
	if(!!gCoords){
		if(!!this.grid[gCoords.y][gCoords.x].visible){
			this._blockHit(gCoords);
			collision = true;
		}
	}

	if(
		p.x >= this.player.pos.x &&
		p.x <= this.player.pos.x + this.player.w &&
		p.y >= this.player.pos.y &&
		p.y <= this.player.pos.y + this.player.h
	){
		collision = true;
	}

	return collision;
};

Breakout.prototype._blockHit = function(coords){
	this.grid[coords.y][coords.x].visible = false;
};

Breakout.prototype._ballCollisionAngle = function(){
	var a = 1
	//this.ball.angle = this.ball.angle + this.ball.angle/2;
	this.ball.angle = this.ball.angle + this.angleToRad( Math.randRange(100, 180) );
};

Breakout.prototype._ballMove = function(collision){
	var d = new Date().getTime();

	// collision
	if(!!collision){
		this._ballCollisionAngle();
	}

	if(this.oldBallAngle != this.ball.angle || !this.oldBallAngle){
		var a = this.ball.pos.x + this.ball.speed * Math.cos(this.ball.angle);
		var b = this.ball.pos.y + this.ball.speed * Math.sin(this.ball.angle);
		this.x = a - this.ball.pos.x;
		this.y = b - this.ball.pos.y;
	}
	if(!this.oldBallAngle){
		this.oldBallAngle = this.ball.angle;
	}

	var delta = (d - this._startTime) / 500;

	this.ball.pos.x += this.x * delta;
	this.ball.pos.y += this.y * delta;
	this._startTime = d;
};

Breakout.prototype._clearCanvas = function(){
	this.canvas.clearRect(0, 0, this.bodySize.w, this.bodySize.h);
};

Breakout.prototype._moveStart = function(e, elm){
	this._cancelDef(e);
	this.moving = true;
	var pos = {
		x : e.pageX,
		y : e.pageY
	};
	this.player.pos.x = pos.x;
};

Breakout.prototype._move = function(e, elm){
	this._cancelDef(e);
	if(!!this.moving){
		var pos = {
			x : e.pageX,
			y : e.pageY
		};
		this.player.pos.x = pos.x;
	}
};

Breakout.prototype._moveEnd = function(e, elm){
	this._cancelDef(e);
	this.moving = false;
};

Breakout.prototype._touchDetect = function(){
	return ('ontouchend' in document.documentElement);
};

Breakout.prototype._link = function(){
	if(!!this._touchDetect()){
		this.addListener(this.dom.root, 'touchstart', this._moveStart.bind(this));
		this.addListener(this.dom.root, 'touchmove', this._move.bind(this));
		this.addListener(this.dom.root, 'touchend', this._moveEnd.bind(this));
	} else {
		this.addListener(this.dom.root, 'mousedown', this._moveStart.bind(this));
		this.addListener(this.dom.root, 'mousemove', this._move.bind(this));
		this.addListener(this.dom.root, 'mouseup', this._moveEnd.bind(this));
	}
};
