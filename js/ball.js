var Breakout = Breakout || {};

Math._round = function(num){
	return (0.5 + num) >>> 0;
};

Breakout.Ball = JAK.ClassMaker.makeClass({
	NAME : 'Breakout.Ball'
});

Breakout.Ball.prototype.$constructor = function(opt){
	this.opt = {
		player : null,
		r : 11 / 2,
		w : 600,
		h : 400,
		speed : 5,
		maxbounce : (Math.PI / 12),
		pos : {
			x : 300,
			y : 300
		},
		x : 1/1000,
		y : 800/1000,
		canvas : null
	};
	for(var p in opt){
		this.opt[p] = opt[p];
	}

	this.player = this.opt.player;
	this.grid = this.opt.grid;

	this.domCanvas = this.opt.canvas;
	this.canvas = this.domCanvas.getContext('2d');

	this.x = this.opt.x;
	this.y = this.opt.y;
	this.pos = this.opt.pos;
};

Breakout.Ball.prototype._edgeCollision = function(newPos){	
	if(newPos.y < 0) {
		newPos.y = -newPos.y;
		this.y = -this.y;
	} else if(newPos.y+this.opt.r > (this.opt.h-1)) {
		newPos.y -= 2*((newPos.y+this.opt.r)-(this.opt.h-1));
		this.y = -this.y;
	} else if(newPos.x > this.opt.w){
		newPos.x -= 2*((newPos.x)-(this.opt.w-1));
		this.x = -this.x;
	} else if(newPos.x < 0){
		newPos.x = -newPos.x;
		this.x = -this.x;
	}
	return newPos;
};

Breakout.Ball.prototype._gridCollision = function(newPos){
	var gCoords = this.grid.getCoords(newPos);
	if(!!gCoords){
		if(!!this.grid.grid[gCoords.y][gCoords.x].visible){
			newPos = this._blockHit(gCoords, newPos);
		}
	}
	return newPos;
};

Breakout.Ball.prototype._blockHit = function(coords, newPos){
	var gi = this.grid.opt.gridItem;
	
	this.grid.hit(coords, newPos);

	var pos = {
		x : coords.x*gi.w,
		y : coords.y*gi.h
	};
	if(newPos.y <= pos.y+gi.h){
		//newPos.y = -newPos.y;
		this.y = -this.y;
	} else if( newPos.y <= pos.y){
		//newPos.y -= 2*((newPos.y+this.ball.r)-(this.config.HEIGHT-1));
		this.y = -this.y;
	} else if( newPos.x <= pos.x+gi.w ){
		this.x = -this.x;
	} else if (newPos.x >= pos.x){
		this.x = -this.x;
	}
	return newPos;
};

Breakout.Ball.prototype._padCollision = function(newPos){
	if(newPos.y > this.opt.h-this.player.opt.offset-this.player.opt.h && this.pos.y <= this.opt.h-this.player.opt.offset-this.player.opt.h) {
		var intersectX = this.pos.x - ((this.pos.y - (this.opt.h-this.player.opt.offset-this.player.opt.h))*(this.pos.x-newPos.x))/(this.pos.y - newPos.y);
		var intersectY = this.opt.h-this.player.opt.offset-this.player.opt.h;
		if(intersectY >= this.player.pos.y && intersectY <= this.player.pos.y+this.player.opt.h && intersectX >= this.player.pos.x && intersectX <= this.player.pos.x+this.player.opt.w) {
			var relativeIntersectY = (this.player.pos.x+(this.player.opt.w)) - intersectX;
			var bounceAngle = (relativeIntersectY/(this.player.opt.w/2)) * (Math.PI/2 - this.opt.maxbounce);
			var ballSpeed = Math.sqrt(this.x*this.x + this.y*this.y);
			var ballTravelLeft = (newPos.y-intersectY)/(newPos.y-this.pos.y);
			this.x = ballSpeed*Math.cos(bounceAngle);
			this.y = ballSpeed*Math.sin(bounceAngle)*-1;
			newPos.x = intersectX - ballTravelLeft*ballSpeed*Math.cos(bounceAngle);
			newPos.y = intersectY - ballTravelLeft*ballSpeed*Math.sin(bounceAngle);
		}
	}
	return newPos;
};

Breakout.Ball.prototype.update = function(ms){
	var newPos = {
		x : 0,
		y : 0
	};
	newPos.x = this.pos.x + this.x*ms;
	newPos.y = this.pos.y + this.y*ms;
	
	newPos = this._edgeCollision(newPos);
	newPos = this._gridCollision(newPos);
	newPos = this._padCollision(newPos);

	this.pos = newPos;
};

Breakout.Ball.prototype.draw = function(){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.fillStyle = 'rgb(255,0,0)';
	this.canvas.arc(this.pos.x, this.pos.y, this.opt.r, 0, 6.28, false);
	this.canvas.fill();
	this.canvas.closePath();
	this.canvas.restore();
};
