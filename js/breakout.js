
Math.randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	return rand
}

Math._round = function(num){
	return (0.5 + num) >>> 0;
};

var Breakout = Breakout || {};

Breakout.Game = JAK.ClassMaker.makeClass({
	NAME : 'Breakout.Game',
	IMPLEMENT : JAK.ISignals
});

Breakout.Game.prototype.$constructor = function(root){
	this.Stats = new Stats();
    this.Stats.getDomElement().style.position = 'absolute';
    this.Stats.getDomElement().style.left = '0px';
    this.Stats.getDomElement().style.top = '0px';
    document.body.appendChild( this.Stats.getDomElement() );

	this.dom = {};
	this.ec = [];
	this.sigs = [];

	this.dom.root = JAK.gel(root);
	this.img = new Image();
	this.spriteImage = './img/breakout_sprites.png';

	this.timekeeper = JAK.Timekeeper.getInstance();

	this._config();
	this._makeImages();
	//this._build();
	this._link();
};

Breakout.Game.prototype._config = function(){
	this.config = {
		SLEEPTIME : 3,
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
			h : 2
		}
	};
	this.config.gridItem = {
		w : this.config.WIDTH / this.config.grid.w,
		h : this.config.HEIGHT / this.config.grid.w
	};

	this.lastTime = new Date().getTime();

	// ball
	this.balls = [];
};

Breakout.Game.prototype._makeImages = function(){
	this.img = new Image();
	this.ec.push( JAK.Events.addListener(this.img, 'load', this._imageLoaded.bind(this)) );
	this.img.src = this.spriteImage;
};

Breakout.Game.prototype._imageLoaded = function(e, elm){
	this.imgSize = {
		w : this.img.width,
		h : this.img.height
	};

	this.sprites = {};

	this.dom.imageCanvas = JAK.mel('canvas', { width : this.config.gridItem.w, height : this.config.gridItem.h });
	this.dom.root.appendChild(this.dom.imageCanvas);
	this.imageCanvas = this.dom.imageCanvas.getContext('2d');
	//this.imageCanvas.drawImage(this.img, 0, 0);

	this._makeBrickSprites();

	this._build();
};

Breakout.Game.prototype._makeBrickSprites = function(){
	this.sprites.bricks = {};

	// red
	var img = new Image();
	var brick = this.imageCanvas.drawImage(this.img, 0, 0, 32, 32, 0, 0, this.config.gridItem.w, this.config.gridItem.h);
	var bd = this.dom.imageCanvas.toDataURL();
	img.src = bd;
	var obj = {
		img : img,
		color : 'rgb(255, 0, 0)',
		hits : 1,
		score : 50
	};
	this.sprites.bricks.red = obj;

	this.imageCanvas.clearRect(0, 0, this.config.gridItem.w, this.config.gridItem.h);

	// purple
	img = new Image();
	var brick = this.imageCanvas.drawImage(this.img, 39, 0, 32, 32, 0, 0, this.config.gridItem.w, this.config.gridItem.h);
	var bd = this.dom.imageCanvas.toDataURL();
	img.src = bd;
	var obj = {
		img : img,
		color : 'rgb(255, 0, 255)',
		hits : 1,
		score : 100
	};
	this.sprites.bricks.purple = obj;
};

Breakout.Game.prototype.angleToRad = function(angle){
	var rad = Math.PI*angle/180;
	return rad;
};

Breakout.Game.prototype.radToAngle = function(rad){
	var angle = rad*180/Math.PI;
	return angle;
};

Breakout.Game.prototype._build = function(){
	// canvas element
	this.dom.canvas = document.createElement('canvas');
	this.dom.canvas.width = this.config.WIDTH;
	this.dom.canvas.height = this.config.HEIGHT;
	// canvas context
	this.canvas = this.dom.canvas.getContext('2d');
	// canvas append
	this.dom.root.appendChild(this.dom.canvas);

	this._start();
};

Breakout.Game.prototype._start = function(){
	// particle effect
	this.explode = new Explo(this.dom.canvas);
	// grid instance
	this._makeGrid();
	// player instance
	this._makePlayer();
	// ball instance
	this._makeBall();
	// tick
	this.timekeeper.addListener(this, '_tick', 1);
};

Breakout.Game.prototype._makeGrid = function(){
	var grid = {
		bricks : this.sprites.bricks,
		canvas : this.dom.canvas,
		body : {
			w : this.config.WIDTH,
			h : this.config.HEIGHT
		},
		w : this.config.grid.w,
		h : this.config.grid.h
	};
	this.grid = new Breakout.Grid(grid);
};

Breakout.Game.prototype._makeBall = function(){
	this.y = 800/1000;
	this.x = 1/100;

	var bPos = {
		x : 300,
		y : 300
	};
	var speed = 5;
	/*
	var a = bPos.x + speed * Math.cos(this.angleToRad(90));
	var b = bPos.y + speed * Math.sin(this.angleToRad(90));
	this.x = a - bPos.x;
	this.y = b - bPos.y;	
	*/
	var ball = {
		player : this.player,
		grid : this.grid,
		r : this.config.BALLDIAMETER / 2,
		w : this.config.WIDTH,
		h : this.config.HEIGHT,
		speed : speed,
		maxbounce : this.config.MAXBOUNCEANGLE,
		pos : bPos,
		x : this.x,
		y : this.y,
		canvas : this.dom.canvas
	};
	this.balls.push( new Breakout.Ball(ball) );
};

Breakout.Game.prototype._makePlayer = function(){
	// player
	var player = {
		root : this.dom.root,
		canvas : this.dom.canvas,
		w : this.config.PADDLEWIDTH,
		h : this.config.PADDLEHEIGHT,
		color : 'rgb(0,0,0)',
		offset : this.config.PADDLEOFFSET
	};
	player.pos = {
		x : parseInt((this.config.WIDTH-player.w)/2),
		//x : this.config.WIDTH - this.player.w - this.config.PADDLEOFFSET,
		y : this.config.HEIGHT - player.h - this.config.PADDLEOFFSET
		//y : parseInt((this.config.HEIGHT-this.player.h)/2)
	};
	this.player = new Breakout.Player(player);
};

Breakout.Game.prototype._tick = function(){
	var d = new Date().getTime();
	var ms = (d - this.lastTime) / this.config.SLEEPTIME;
	this.lastTime = d;

	this._update(ms);
	this._draw();
};

Breakout.Game.prototype._update = function(ms){
	this.Stats.update();
	if(this.balls.length == 1){ this.balls[0].update(ms); }
	else {
		for(var i=0;i<this.balls.length;i++){
			this.balls[i].update(ms);
		}
	}
};

Breakout.Game.prototype._clear = function(){
	this.canvas.clearRect(0, 0, this.config.WIDTH, this.config.HEIGHT);
};

Breakout.Game.prototype._draw = function(){
	this._clear();
	// explode
	this.explode.draw();
	// grid
	this.grid.draw();
	// player
	this.player.draw();
	// ball
	if(this.balls.length == 1){ this.balls[0].draw(); }
	else {
		for(var i=0;i<this.balls.length;i++){
			this.balls[i].draw();
		}
	}
};

Breakout.Game.prototype._blockHit = function(e){
	var coords = e.data.coords;
	var pos = e.data.pos;
	var color = 'color' in e.data ? e.data.color : 'red';
	this.explode.boom(pos, color);
};

Breakout.Game.prototype._link = function(){
	this.sigs.push( this.addListener('blockHit', this._blockHit.bind(this)) );
};
