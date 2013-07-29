var Breakout = Breakout || {};

Math.randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	return rand
}

Breakout.Grid = JAK.ClassMaker.makeClass({
	NAME : 'Breakout.Grid',
	IMPLEMENT : JAK.ISignals
});

Breakout.Grid.prototype.$constructor = function(opt){
	this.opt = {
		canvas : null,
		body : {
			w : 600,
			h : 400
		},
		w : 40,
		h : 10
	};
	for(var p in opt){
		this.opt[p] = opt[p];
	}
	this.opt.gridItem = {
		w : this.opt.body.w / this.opt.w,
		h : this.opt.body.h / this.opt.w
	};

	this.domCanvas = this.opt.canvas;
	this.canvas = this.domCanvas.getContext('2d');

	this._makeGrid()
};

Breakout.Grid.prototype.hit = function(coords, pos){
	this.grid[coords.y][coords.x].visible = false;
	this.makeEvent('blockHit', {
		coords : coords,
		pos : pos,
		color : this.grid[coords.y][coords.x].color
	});
};

Breakout.Grid.prototype._makeGrid = function(){
	this.grid = [];
	for(var i=0;i<this.opt.h;i++){
		g = [];
		for(var j=0;j<this.opt.w;j++){
			var obj = {
				visible : true,
				color : 'rgb('+Math.randRange(0,255)+','+Math.randRange(0,255)+','+Math.randRange(0,255)+')'
			}
			g.push(obj);
		}
		this.grid.push(g);
	}
};

Breakout.Grid.prototype.getCoords = function(pos){
	var maxHeight = this.opt.gridItem.h * this.opt.h;
	var coords = null;
	if(pos.y < maxHeight && pos.y > 0 && pos.x > 0 && pos.x < this.opt.body.w){
		coords = {};
		coords.x = Math.floor(pos.x / this.opt.gridItem.w);
		coords.y = Math.floor(pos.y / this.opt.gridItem.h);
	}
	return coords;
};

Breakout.Grid.prototype.draw = function(){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.strokeStyle = 'rgb(0,0,0)';
	for(var i=0;i<this.grid.length;i++){
		for(var j=0;j<this.grid[i].length;j++){
			var item = this.grid[i][j];
			if(!!item.visible){
				var size = {
					w : this.opt.gridItem.w,
					h : this.opt.gridItem.h
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
	this.canvas.closePath();
	this.canvas.restore();
};
