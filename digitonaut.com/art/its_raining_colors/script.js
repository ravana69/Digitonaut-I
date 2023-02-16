"use strict";

window.addEventListener("load",function() {

  const step = 6;
  const side = 5;
  let canv, ctx;   // canvas and context : global variables (I know :( )
  let maxx, maxy;  // canvas sizes (in pixels)

  let grid;      // array of squares
  let nbx, nby;  // grid size (in elements, not pixels)

// for animation
  let animState;
  let plops;
  let queue;

// shortcuts for Math.…

  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const m2PI = Math.PI * 2;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;
  const mPIS3 = Math.PI / 3;

//-----------------------------------------------------------------------------
// miscellaneous functions
//-----------------------------------------------------------------------------

  function alea (min, max) {
// random number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') return min * mrandom();
    return min + (max - min) * mrandom();
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function intAlea (min, max) {
// random integer number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') {
      max = min; min = 0;
    }
    return mfloor(min + (max - min) * mrandom());
  } // intAlea
  
//-----------------------------------------------------------------------------
function Cell(kx, ky, hue) {
  this.kx = kx;
  this.ky = ky;
  this.x = step * kx + (step - side) / 2;
  this.y = step * ky + (step - side) / 2;
  this.hue = hue;
} // Cell
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cell.prototype.draw = function() {
  ctx.fillStyle = `hsl(${this.hue},100%,50%)`
  ctx.fillRect(this.x, this.y, side, side);
} // Cell.prototype.draw

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cell.prototype.addHue = function(hue) {
  this.hue = (this.hue + hue) % 360;
  this.draw();
} // Cell.prototype.draw

//-----------------------------------------------------------------------------
function Plop(kx, ky, tstamp, dradius) {
  this.kx = kx;
  this.ky = ky;
  this.hue = intAlea(60, 300);
  this.radius = 0;
  this.list0 = [{u: 1, v: 0}];
  this.list1 = [{u: 1, v: 1}];
  grid[ky][kx].addHue(this.hue);
  this.tstamp = tstamp;
  this.dradius = dradius ? dradius : alea(0.5, 1); // keep speed if innermost side of ring
  this.radiusMax = 0;
  let r1 = mhypot(kx,ky);
  if (r1 > this.radiusMax) this.radiusMax = r1;
  r1 = mhypot(nbx - kx, ky);
  if (r1 > this.radiusMax) this.radiusMax = r1;
  r1 = mhypot(nbx - kx, nby - ky);
  if (r1 > this.radiusMax) this.radiusMax = r1;
  r1 = mhypot(kx, nby - ky);
  if (r1 > this.radiusMax) this.radiusMax = r1;
  ++this.radiusMax;
// management of ring inner edge
  this.second = !!dradius;
  if (! this.second) { // current ring is outer edge
    this.radiusSecond = alea(2, 3); // thickness of ring
  }
} // Plop

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Plop.prototype.run = function(tstamp) {

  if (tstamp - this.tstamp < 25) return; // not time yet
  this.tstamp += 25;

  let linit;

  this.radius += this.dradius;
  if (!this.second && this.radius >= this.radiusSecond) {
    queue.push({kx: this.kx, ky: this.ky, speed: this.dradius});
    this.second = true; // to avoid generation of several inside edges
  }
  linit = this.list0.length;
  for (let k = 0; k < linit; ++k) {
    this.prop0(this.list0[k].u, this.list0[k].v);
  } // for k
  this.list0.splice(0, linit); // keep only new contents

  linit = this.list1.length;
  for (let k = 0; k < linit; ++k) {
    this.prop1(this.list1[k].u, this.list1[k].v);
  } // for k
  this.list1.splice(0, linit); // keep only new contents

} // Plop.prototype.run

Plop.prototype.prop0 = function(u, v) {
  if (mhypot(u, v) <= this.radius) {
    this.include(0, this.kx + u, this.ky + v);
    this.include(1, this.kx - v, this.ky + u);
    this.include(2, this.kx - u, this.ky - v);
    this.include(3, this.kx + v, this.ky - u);
    this.prop0(u + 1, v); // propagate
    if (u == v + 2) this.prop0(u, v + 1);
  } else this.list0.push({u: u, v: v});

} // Plop.prototype.prop0

Plop.prototype.prop1 = function(u, v) {
  if (mhypot(u, v) <= this.radius) {
    this.include(0, this.kx + v, this.ky + u);
    this.include(1, this.kx - u, this.ky + v);
    this.include(2, this.kx - v, this.ky - u);
    this.include(3, this.kx + u, this.ky - v);
    this.prop1(u + 1, v); // propagate
    if (u == v + 1) this.prop1(u, v + 1);
  } else this.list1.push({u: u, v: v});

} // Plop.prototype.prop1

Plop.prototype.include = function(idx, x, y) {
  if (x >= nbx || x < 0 || y < 0 || y >= nby) return; // out of grid
  grid[y][x].addHue(this.hue);
}

//-----------------------------------------------------------------------------

function createGrid() {
  let ligne, cell;
  let hue = intAlea(360);
  grid = [];
  plops = [];
  for (let ky = 0; ky < nby; ++ky) {
    grid [ky] = ligne = [];
    for (let kx = 0; kx < nbx; ++kx) {
      ligne[kx] = cell = new Cell(kx, ky, hue);
      grid[ky][kx].draw();
    } // for ky
  } // for ky
} // createGrid

//-----------------------------------------------------------------------------
// returns false if nothing can be done, true if drawing done

function startOver() {

  let c1, c2, kbg; // temporary variables for bg color

// canvas dimensions

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.style.left = ((window.innerWidth ) - maxx) / 2 + 'px';
  canv.style.top = ((window.innerHeight ) - maxy) / 2 + 'px';

  ctx.canvas.width = maxx;
  ctx.canvas.height = maxy;
  ctx.lineCap = 'round';   // placed here because reset when canvas resized
  ctx.imageSmoothingEnabled = false;
  nbx = mceil(maxx / step);
  nby = mceil(maxy / step);

  if (nbx < 3 || nby < 3) return false; // nothing to draw
  queue = [];
  createGrid();
  
  return true; // ok

} // startOver

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function clickCanvas(event) {
  if (event.target.tagName == 'CANVAS') {
    let ax = mfloor(event.clientX / step);
    let ay = mfloor(event.clientY / step);
    queue.push({kx: ax, ky:ay});
  }

} //  clickCanvas

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function animate(tStamp) {

  let click;
  switch(animState) {
    case 0 :
      if (startOver()) ++animState;
      break;
    case 1 :
      if (queue.length > 0 ) {
        click = queue.shift();
        plops.push(new Plop(click.kx, click.ky, tStamp, click.speed));
        click = false;
      }
      for (let k = plops.length - 1; k >= 0; --k) {
        plops[k].run(tStamp);
        if (plops[k].radius >= plops[k].radiusMax) {
          plops.splice(k, 1); // remove empty plop
        }
      } // for k
      if (plops.length < 10) plops.push(new Plop(intAlea(nbx),intAlea(nby),tStamp));
  } // switch
  window.requestAnimationFrame(animate);

} // animate
//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

  {
    canv = document.createElement('canvas');
    canv.style.position="absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
  } // canvas creation

  window.addEventListener('click',clickCanvas);
  animState = 0; // to startOver
  animate();

}); // window load listener