function Entity(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.vx = 0;
	this.vy = 0;
	this.size = SIZE;
	this.max = SPEED;
	
	this.update;
	this.update = function(delta) {

		if(this.vx > this.max) {
			this.vx = this.max;
		} else if(this.vx < -this.max){
			this.vx = -this.max;
		}
		if(this.vy > this.max) {
			this.vy = this.max;
		} else if(this.vy < -this.max) {
			this.vy = -this.max;
		}
		
		this.x += this.vx * delta;
		this.y += this.vy * delta;
		var edge = false
		if(this.getLeft() < 0) {
			this.setLeft(0);
			this.vx = 0;
			edge = true
		}else if(this.getRight() > canvas.width) {
			this.setRight(canvas.width);
			this.vx = 0;
			edge = true
		}
		if(this.getTop() < 0) {
			this.setTop(0);
			this.vy = 0
			edge = true
		}else if(this.getBottom() > canvas.height) {
			this.setBottom(canvas.height);
			this.vy = 0
			edge = true
		}
		return edge;
	};
	this.draw = function() {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.size, this.size);
	};
	this.getLeft = function() {
		return this.x;
	};
	this.setLeft = function(value) {
		 this.x = value;
	};
	this.getTop = function() {
		return this.y;
	};
	this.setTop = function(value) {
		this.y = value;
	};
	this.getRight = function() {
		return this.x + this.size;
	};
	this.setRight = function(value) {
		this.x = value - this.size;
	};
	this.getBottom = function() {
		return this.y + this.size;
	};
	this.setBottom = function(value) {
		this.y = value - this.size;
	};
	this.getMidX = function() {
		return this.x + this.size / 2;
	};
	this.setMidX = function(value) {
		this.x = value - this.size / 2;
	};
	this.getMidY = function() {
		return this.y + this.size / 2;
	};
	this.setMidY = function(value) {
		this.y = value - this.size / 2;
	};
}