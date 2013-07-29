var Breakout = Breakout || {};

Breakout.Player = JAK.ClassMaker.makeClass({
	NAME : 'Breakout.Player'
});

Breakout.Player.prototype.$constructor = function(opt){
	this.opt = {
		root : null,
		canvas : null,
		w : 80,
		h : 10,
		color : 'rgb(0,0,0)',
		offset : 4
	};
	this.opt.pos = {
		x : parseInt((600-this.opt.w)/2),
		//x : this.config.WIDTH - this.opt.w - this.config.PADDLEOFFSET,
		y : 400 - this.opt.h - 4
		//y : parseInt((this.config.HEIGHT-this.opt.h)/2)
	};
	for(var p in opt){
		this.opt[p] = opt[p];
	}
	this.domCanvas = this.opt.canvas;
	this.canvas = this.domCanvas.getContext('2d');
	this.pos = this.opt.pos;
	this.ec = [];
	this.canvasPos = JAK.DOM.getBoxPosition(this.domCanvas);

	this._link();
};

Breakout.Player.prototype.draw = function(){
	this.canvas.save();
	this.canvas.fillStyle = this.opt.color;
	this.canvas.strokeStyle = 'rgb(0,0,0)';
	var pos = {
		x : this.pos.x,
		y : this.pos.y
	};
	this.canvas.fillRect(pos.x, pos.y, this.opt.w, this.opt.h);
	this.canvas.strokeRect(pos.x, pos.y, this.opt.w, this.opt.h);
	this.canvas.restore();
};

Breakout.Player.prototype._moveStart = function(e, elm){
	JAK.Events.cancelDef(e);
	this.moving = true;
	var pos = {
		x : e.pageX,
		y : e.pageY
	};
	var x = pos.x - this.canvasPos.left - this.opt.w/2;
	var y = pos.y;
	this.pos.x = x;
	//this.pos.y = pos.y;
};

Breakout.Player.prototype._move = function(e, elm){
	JAK.Events.cancelDef(e);
	if(!!this.moving){
		var pos = {
			x : e.pageX,
			y : e.pageY
		};
		var x = pos.x - this.canvasPos.left - this.opt.w/2;
		var y = pos.y;
		this.pos.x = x;
		//this.pos.y = pos.y;
	}
};

Breakout.Player.prototype._moveEnd = function(e, elm){
	JAK.Events.cancelDef(e);
	this.moving = false;
};

Breakout.Player.prototype._touchDetect = function(){
	return ('ontouchend' in document.documentElement);
};

Breakout.Player.prototype._link = function(){
	if(!!this._touchDetect()){
		this.ec.push(JAK.Events.addListener(this.opt.root, 'touchstart', this._moveStart.bind(this)));
		this.ec.push(JAK.Events.addListener(this.opt.root, 'touchmove', this._move.bind(this)));
		this.ec.push(JAK.Events.addListener(this.opt.root, 'touchend', this._moveEnd.bind(this)));
	} else {
		this.ec.push(JAK.Events.addListener(this.opt.root, 'mousedown', this._moveStart.bind(this)));
		this.ec.push(JAK.Events.addListener(this.opt.root, 'mousemove', this._move.bind(this)));
		this.ec.push(JAK.Events.addListener(this.opt.root, 'mouseup', this._moveEnd.bind(this)));
	}
};
