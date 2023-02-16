let font;
let t = [];
const MIN_RADIUS = 20;
const STRS = ["DIGITAL - ","PLANETS - ","DIGITONAUT - ","ASTRONAUT - ","- ---- - - - -","~~~ ~~ ~ ~~ ~~~","UNIVERSAL - ","INCLUSIVE - ","FUTURE ","PROUD "];

function preload()
{
	font = loadFont("am.ttf");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	textFont(font);
	t[0] = new TextCircle(STRS[int(random(STRS.length))]);
}

function draw() {
	background(245);
	for(let i = t.length-1; i >= 0; i--){
		if(i == t.length-1)t[i].update(t[i].radius+5);
		else t[i].update(t[i+1].radius-t[i+1].texSize);
		t[i].display();
		if(t[i].isDead())t.splice(i,1);
	}
	if(t[0].radius > MIN_RADIUS)t.unshift(new TextCircle(STRS[int(random(STRS.length))]));
}


class TextCircle
{
	constructor(_str)
	{
		this.str = _str;
		this.charNum = 50;
		this.radius = MIN_RADIUS;
		this.angle = 0;
		this.texSize = 0;
		this.rotateSp = random(-PI/500,PI/500);
	}
	
	update(newRadius)
	{
		this.radius = newRadius;
		this.texSize = this.radius*TAU/this.charNum;
		this.angle += this.rotateSp;
	}
	
	display()
	{
		textSize(this.texSize);
		const angleSpan = TAU/this.charNum;
		let i = 0;
		for(let r = TAU; r > 0; r -= angleSpan)
		{
			let char = this.str.charAt(i%this.str.length);
			push();
			translate(width/2,height/2);
			rotate(r+this.angle);
			text(char,0,this.radius);
			pop();
			i++
		}
	}
	
	isDead()
	{
		if(this.radius > max(width,height)*0.8)return true;
		else return false;
	}
}
