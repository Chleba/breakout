
Math.randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	return rand
}

var Breakout = JAK.ClassMaker.makeClass({
	NAME : 'Breakout'
});

Breakout.prototype.$constructor = function(root){
	this.dom = {};
	this.ec = [];

	this.dom.root = JAK.gel(root);

	this.timekeeper = JAK.Timekeeper.getInstance();

	this._config();
	this._makeGrid();
	this._build();
	this._link();
};

Breakout.prototype._config = function(){
	this.config = {
		SLEEPTIME : 1,
		PAUSEDSLEEPTIME : 100,
		WIDTH : 600,
		HEIGHT : 400,
		BALLDIAMETER : 11,
		PADDLEWIDTH : 60,
		PADDLEHEIGHT : 10,
		PADDLEOFFSET : 4,
		PADDLEMAXSPEED : (1000/1000),
		MAXBOUNCEANGLE : (Math.PI/12),
		grid : {
			w : 40,
			h : 10
		}
	};
	this.config.gridItem = {
		w : this.config.WIDTH / this.config.grid.w,
		h : this.config.HEIGHT / this.config.grid.w
	};

	this.lastTime = new Date().getTime();

	// ball
	this.ball = {
		r : this.config.BALLDIAMETER / 2,
		w : 10,
		h : 10,
		speed : 5
	};
	this.ball.pos = {
		x : 300,
		y : 300
	};
	this.y = 800/1000;
	this.x = 1/1000;

	// player
	this.player = {
		w : this.config.PADDLEWIDTH,
		h : this.config.PADDLEHEIGHT,
		color : 'rgb(0,0,0)'
	};
	this.player.pos = {
		x : parseInt((this.config.WIDTH-this.player.w)/2),
		//x : this.config.WIDTH - this.player.w - this.config.PADDLEOFFSET,
		y : this.config.HEIGHT - this.player.h - this.config.PADDLEOFFSET
		//y : parseInt((this.config.HEIGHT-this.player.h)/2)
	};
};

Breakout.prototype.angleToRad = function(angle){
	var rad = Math.PI*angle/180;
	return rad;
};

Breakout.prototype.radToAngle = function(rad){
	var angle = rad*180/Math.PI;
	return angle;
};

Breakout.prototype._build = function(){
	// canvas element
	this.dom.canvas = document.createElement('canvas');
	this.dom.canvas.width = this.config.WIDTH;
	this.dom.canvas.height = this.config.HEIGHT;

	// canvas context
	this.canvas = this.dom.canvas.getContext('2d');

	// canvas append
	this.dom.root.appendChild(this.dom.canvas);
	this.canvasPos = JAK.DOM.getBoxPosition(this.dom.canvas);

	this._start();
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

Breakout.prototype._start = function(){
	//this._tick()
	this.timekeeper.addListener(this, '_tick', 1);
};

Breakout.prototype._setBallPos = function(pos){
	var pos = pos || this.ball.pos;
	this.ball.pos = pos;
};

Breakout.prototype._tick = function(){
	var d = new Date().getTime();
	var ms = (d - this.lastTime) / 2;
	this.lastTime = d;

	this._update(ms);
	this._draw();
};

Breakout.prototype._update = function(ms){
	var pos = this._updateBall(ms);
	this._setBallPos(pos);
};

Breakout.prototype._edgeCollision = function(newPos){
	if(newPos.y < 0) {
		newPos.y = -newPos.y;
		this.y = -this.y;
	} else if(newPos.y+this.ball.r > (this.config.HEIGHT-1)) {
		newPos.y -= 2*((newPos.y+this.ball.r)-(this.config.HEIGHT-1));
		this.y = -this.y;
	} else if(newPos.x > this.config.WIDTH){
		newPos.x -= 2*((newPos.x+this.ball.r)-(this.config.WIDTH-1));
		this.x = -this.x;
	} else if(newPos.x < 0){
		newPos.x = -newPos.x;
		this.x = -this.x;
	}
	return newPos;
};

Breakout.prototype._padCollision = function(newPos){
	if(newPos.y > this.config.HEIGHT-this.config.PADDLEOFFSET-this.player.h && this.ball.pos.y <= this.config.HEIGHT-this.config.PADDLEOFFSET-this.player.h) {
		var intersectX = this.ball.pos.x - ((this.ball.pos.y - (this.config.HEIGHT-this.config.PADDLEOFFSET-this.player.h))*(this.ball.pos.x-newPos.x))/(this.ball.pos.y - newPos.y);
		var intersectY = this.config.HEIGHT-this.config.PADDLEOFFSET-this.player.h;

		if(intersectY >= this.player.pos.y && intersectY <= this.player.pos.y+this.player.h && intersectX >= this.player.pos.x && intersectX <= this.player.pos.x+this.player.w) {
			var relativeIntersectY = (this.player.pos.x+(this.player.w)) - intersectX;
			var bounceAngle = (relativeIntersectY/(this.player.w/2)) * (Math.PI/2 - this.config.MAXBOUNCEANGLE);
			var ballSpeed = Math.sqrt(this.x*this.x + this.y*this.y);
			var ballTravelLeft = (newPos.y-intersectY)/(newPos.y-this.ball.pos.y);
			this.x = ballSpeed*Math.cos(bounceAngle);
			this.y = ballSpeed*Math.sin(bounceAngle)*-1;
			newPos.x = intersectX - ballTravelLeft*ballSpeed*Math.cos(bounceAngle);
			newPos.y = intersectY - ballTravelLeft*ballSpeed*Math.sin(bounceAngle);
		}
	}
	return newPos;
};

Breakout.prototype._getGridCoords = function(pos){
	var maxHeight = this.config.gridItem.h * this.config.grid.h;
	var coords = null;
	if(pos.y <= maxHeight && pos.y >= 0 && pos.x >= 0 && pos.x <= this.config.WIDTH){
		coords = {};
		coords.x = Math.floor(pos.x / this.config.gridItem.w);
		coords.y = Math.floor(pos.y / this.config.gridItem.h);
	}
	return coords;
};

Breakout.prototype._blockHit = function(coords, newPos){
	var gi = this.config.gridItem;

	var pos = {
		x : coords.x*this.config.gridItem.w,
		y : coords.y*this.config.gridItem.h
	};
	if(newPos.y <= pos.y+gi.h){
		console.log(pos)
		newPos.y = -newPos.y;
		this.y = -this.y;
	}/* else if( newPos.y <= pos.y){
		newPos.y -= 2*((newPos.y+this.ball.r)-(this.config.HEIGHT-1));
		this.y = -this.y;
	} else if( newPos.x <= pos.x+gi.w ){

	}*/

	return newPos;
};

Breakout.prototype._gridCollision = function(newPos){
	var gCoords = this._getGridCoords(newPos);
	if(!!gCoords){
		if(!!this.grid[gCoords.y][gCoords.x].visible){
			newPos = this._blockHit(gCoords, newPos);
		}
	}
	return newPos;
};

Breakout.prototype._updateBall = function(ms){
	var newPos = {
		x : 0,
		y : 0
	};
	newPos.x = this.ball.pos.x + this.x*ms;
	newPos.y = this.ball.pos.y + this.y*ms;
	
	newPos = this._gridCollision(newPos);
	newPos = this._edgeCollision(newPos);
	newPos = this._padCollision(newPos);

	return newPos;
};

Breakout.prototype._clear = function(){
	this.canvas.clearRect(0, 0, this.config.WIDTH, this.config.HEIGHT);
};

Breakout.prototype._draw = function(){
	this._clear();
	this._drawGrid();
	this._drawPlayer();
	this._drawBall();
};

Breakout.prototype._drawGrid = function(){
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

Breakout.prototype._drawBall = function(){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.fillStyle = 'rgb(255,0,0)';
	this.canvas.arc(this.ball.pos.x, this.ball.pos.y, this.ball.r, 0, 6.28, false);
	this.canvas.fill();
	this.canvas.closePath();
	this.canvas.restore();
};

Breakout.prototype._drawPlayer = function(){
	this.canvas.save();
	this.canvas.fillStyle = this.player.color;
	this.canvas.strokeStyle = 'rgb(0,0,0)';
	var pos = {
		x : this.player.pos.x,
		y : this.player.pos.y
	};
	this.canvas.fillRect(pos.x, pos.y, this.player.w, this.player.h);
	this.canvas.strokeRect(pos.x, pos.y, this.player.w, this.player.h);
	this.canvas.restore();
};

Breakout.prototype._moveStart = function(e, elm){
	JAK.Events.cancelDef(e);
	this.moving = true;
	var pos = {
		x : e.pageX,
		y : e.pageY
	};
	var x = pos.x - this.canvasPos.left - this.player.w/2;
	var y = pos.y;
	this.player.pos.x = x;
	//this.player.pos.y = pos.y;
};

Breakout.prototype._move = function(e, elm){
	JAK.Events.cancelDef(e);
	if(!!this.moving){
		var pos = {
			x : e.pageX,
			y : e.pageY
		};
		var x = pos.x - this.canvasPos.left - this.player.w/2;
		var y = pos.y;
		this.player.pos.x = x;
		//this.player.pos.y = pos.y;
	}
};

Breakout.prototype._moveEnd = function(e, elm){
	JAK.Events.cancelDef(e);
	this.moving = false;
};

Breakout.prototype._touchDetect = function(){
	return ('ontouchend' in document.documentElement);
};

Breakout.prototype._link = function(){
	if(!!this._touchDetect()){
		this.ec.push(JAK.Events.addListener(this.dom.root, 'touchstart', this._moveStart.bind(this)));
		this.ec.push(JAK.Events.addListener(this.dom.root, 'touchmove', this._move.bind(this)));
		this.ec.push(JAK.Events.addListener(this.dom.root, 'touchend', this._moveEnd.bind(this)));
	} else {
		this.ec.push(JAK.Events.addListener(this.dom.root, 'mousedown', this._moveStart.bind(this)));
		this.ec.push(JAK.Events.addListener(this.dom.root, 'mousemove', this._move.bind(this)));
		this.ec.push(JAK.Events.addListener(this.dom.root, 'mouseup', this._moveEnd.bind(this)));
	}
};
