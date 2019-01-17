var canvas;
var context;
var player;
var doomguySprite = new Image();
var zombieSprites = new Image();
var memeswarSprite = new Image();
var enemies = [];
var bullets = [];
var walls = [];
var inputs = {
	left: false,
	up: false,
	right: false,
	down: false,
	click: false
};
var mx;
var my;
var timestamp;
var SIZE = 50;       // edited, 20, 40
var XSIZE = 27;      // edited, 30, 33
var YSIZE = 15;      // edited, 20, 18
var SPEED = 125;     // edited, 30
var ACC = 100;
var DCC = 0.3;       // edited, 0.5
var COOL = 0.2;      // edited, 0.5
var SPAWN = 0.5;
var coolTimer = 0;
var spawnTimer = 0;
var score = 0;
var ENEMY_RAND = 0.33;
var DELTA_MAX = 0.1;
var playing;
var map =
"                           "+
"                           "+
"                           "+
"      XXXXXX   XXXXXX      "+
"     X               X     "+
"    X                 X    "+
"    X                 X    "+
"    XXXXX         XXXXX    "+
"    X                 X    "+
"    X                 X    "+
"                           "+
"                           "+
"                           "+
"                           "+
"                           ";
var w = window.innerWidth
    document.documentElement.clientWidth;
var h = window.innerHeight
    document.documentElement.clientHeight;

function init() {
    canvas = document.getElementById('canvas');
	canvas.width = w;     //XSIZE * SIZE;
	canvas.height = h;    //YSIZE * SIZE;

	context = canvas.getContext('2d');

	zombieSprites.src = 'zombies.png';
	doomguySprite.src = 'memes.png';
	memeswarSprite.src = 'war.png';

	document.addEventListener('keydown', keyDown, false);
	document.addEventListener('keyup', keyUp, false);
	document.addEventListener('mousedown', mousedown, false);
	document.addEventListener('mouseup', mouseup, false);
	document.addEventListener('mousemove', mousemove, false);
	player = new Entity(0, 0, 'orange');
	reset();
}

function reset() {
	playing = true;
	enemies = [];
	bullets = [];
	player.x = 0;
	player.y = 0;
	score = 0;
    
	for(var x=0; x<XSIZE; x++) {
		walls[x] = [];
		for(var y=0; y<YSIZE; y++) {
			if(map.substr(y * XSIZE + x, 1) == 'X') {
			walls[x][y] = new Entity(x * SIZE, y * SIZE, 'brown');
			} else {
				walls[x][y] = null;
			}
		}
	}
	timestamp = Date.now();

	gameLoop();
}
function gameLoop() {

	var now = Date.now();
	var delta = (now - timestamp) / 1000;
	timestamp = now;
	if(delta > delta > DELTA_MAX) delta = DELTA_MAX;
		if(inputs.left){
			player.vx -= ACC * delta;
		} else if(inputs.right) {
			player.vx += ACC * delta;
		} else {
			player.vx -= player.vx * DCC * delta;
		}

		if(inputs.up) {
			player.vy -= ACC * delta;
		} else if(inputs.down) {
			player.vy += ACC * delta;
		} else {
			player.vy -= player.vy * DCC * delta
		}
		if(inputs.click && coolTimer <=0) {
			var half = player.size / 2;
			var dx = mx - player.getMidX();
			var dy = my - player.getMidY();
			var total = Math.abs(dx) + Math.abs(dy);
			var bullet = new Entity(0, 0, 'red');
			bullet.size /= 20;                            // edited, 4
			bullet.setMidX(player.getMidX());
			bullet.setMidY(player.getMidY());
			bullet.max = 300;                            // edited, 100
			bullet.vx = dx / total * bullet.max;
			bullet.vy = dy / total * bullet.max;
			bullets.push(bullet);
			coolTimer = COOL;                            // bullet cooldown
		}else if(coolTimer > 0) {
			coolTimer -= delta;
		};

		player.update(delta);

		if(enemies.length < 10 && spawnTimer <= 0) {
			var enemy = new Entity(400, 400, 'green');
			enemy.setMidX(canvas.width / 2);
			enemy.setMidY(canvas.height / 2);
			enemies.push(enemy);
			spawnTimer = SPAWN;
		} else if(spawnTimer > 0) {
			spawnTimer -= delta;
		}
		var enemy, dx, dy, total;
		for(var i=0; i<enemies.length; i++) {
			enemy=enemies[i];
			dx = player.x - enemy.x;
			dy = player.y - enemy.y;
			if(ENEMY_RAND > Math.random()) dx *= -1;
			else if(ENEMY_RAND > Math.random()) dy *= -1;
			total = Math.abs(dx) + Math.abs(dy);
			enemy.vx += (dx / total) * ACC * delta;
			enemy.vy += (dy / total) * ACC * delta;
			enemy.update(delta);
		}
		for(var i=0; i<enemies.length; i++){
			for(var n=0; n<enemies.length; n++){
				if(i == n) continue;
				if(collides(enemies[i], enemies[n])) {
					shove(enemies[i], enemies[n]);
				}
			}
		}
		var bullet;
		for(var i=bullets.length-1;i>=0; i--) {
			if(bullets[i].update(delta)) {
				bullets.splice(i, 1);
			} else {
				for(var n=enemies.length-1; n>=0; n--) {
					if(collides(bullets[i], enemies[n])) {
						enemies.splice(n,1);
						bullets.splice(i,1);
						score += 1;
						//if(score >= 0) playing = false;
						break;
					}
				}
			}
		}
		for(var i=0; i<enemies.length; i++) {
			enemy = enemies[i];
			if(collides(player,enemy)) {
				shove(player, enemy);
			}
		}
		hitWalls(player);
		for(var i=0; i<enemies.length; i++) {
			hitWalls(enemies[i]);
		}
		for(var i=bullets.length-1;i>=0; i--) {
			if(hitWalls(bullets[i], true)) {
				bullets.splice(i,1);
			}
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(
				doomguySprite,
				player.x, player.y, player.size, player.size
			);
		for(var i=0; i<enemies.length; i++) {
			context.drawImage(
				zombieSprites,
				enemies[i].x, enemies[i].y, enemies[i].size, enemies[i].size
			);
		}
		for(var i=0; i<bullets.length; i++) {
			bullets[i].draw();
		}
		for(var x=0; x<XSIZE; x++) {
			for(var y=0; y<YSIZE; y++) {
				if(walls[x][y]){
					walls[x][y].draw();
				}
			}
		}
		context.font = 'bold 18px monospace'
		context.fillStyle = 'white';
		context.fillText(score, canvas.width - 50, 40);
	if(playing) {
		window.requestAnimationFrame(gameLoop);
	} else {
		context.drawImage(
			memeswarSprite,
			0, 0, 600, 400
		);
	}
}
function keyDown(e) {
	e.preventDefault();
	switch(e.keyCode) {
		case 37:
		case 65:
			inputs.left = true;
			break;
		case 38:
		case 87:
			inputs.up = true;
			break;
		case 39:
		case 68:
			inputs.right = true;
			break;
		case 40:
		case 83:
			inputs.down = true;
			break;
		case 32:
			if(!playing) reset();
			break;
	}
}
function keyUp(e) {
	e.preventDefault();
	switch(e.keyCode) {
		case 37:
		case 65:
			inputs.left = false;
			break;
		case 38:
		case 87:
			inputs.up = false;
			break;
		case 39:
		case 68:
			inputs.right = false;
			break;
		case 40:
		case 83:
			inputs.down = false;
			break;
	}
}
function mousemove(e) {
	var rect = canvas.getBoundingClientRect();
	mx = e.pageX - rect.left;
	my = e.pageY - rect.top
}
function mousedown(e) {
	inputs.click = true;
}
function mouseup(e) {
	inputs.click = false;
}
function collides(a, b) {
	if(a.getRight()< b.getLeft()) return false;
	if(a.getBottom()< b.getTop()) return false;
	if(a.getLeft()> b.getRight()) return false;
	if(a.getTop()> b.getBottom()) return false;
	return true;
}
function hitWalls(obj, bullet) {
	var xx = Math.floor(obj.x / SIZE);
	var yy = Math.floor(obj.y / SIZE);
	if(xx < 0) xx = 0;
	if(yy < 0) yy = 0;
	var hit = false
	for(var x=xx; x<=xx+1; x++) {
		if(x >= XSIZE) continue;
		for(var y=yy; y<=yy+1; y++) {
			if(y >= YSIZE) continue;
			if(walls[x][y] && collides(obj, walls[x][y])) {
				hit = true;
				if(bullet) {
					walls[x][y] = null;
				} else {
					shove(walls[x][y], obj, true);
				}
			}
		}
	}
	return hit;
}
function shove(a, b, wall) {
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var dxAbs = Math.abs(dx);
	var dyAbs = Math.abs(dy);
	var move;
	if(dxAbs > dyAbs) {
		move = wall ? 0 : b.size - dxAbs;
		if(b.x > a.x) {
			a.x -= move / 2;
			b.setLeft(a.getRight());
		} else {
			a.x += move / 2
			b.setRight(a.getLeft());
		}
	} else {
		move = wall ? 0 : b.size - dyAbs;
		if(b.y > a.y) {
			a.y -= move / 2;
			b.setTop(a.getBottom());
		} else {
			a.y += move / 2;
			b.setBottom(a.getTop());
		}
	}
}
