var c = document.getElementById('canv'),
  $ = c.getContext('2d'),
  w = c.width = window.innerWidth,
  h = c.height = window.innerHeight,
  t = 0, num = 650, u=0,
  s, a, b, 
  x, y, _x, _y,
  _t = 1 / 40;

var anim = function() {
  window.requestAnimationFrame(anim);
  $.globalCompositeOperation = 'source-over';
  $.fillStyle = 'hsla(0, 0%, 5%, 1)';
  $.fillRect(0, 0, w, h);
  $.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 1; i++) {
    x = 0;
    $.beginPath();
    for (var j = 0; j < num; j++) {
      $.strokeStyle = 'hsla('+u*5+',100%,60%,.4)';
      x += .6 * Math.sin(5);
      y = x * Math.sin(i + 2 * t + x / 2) / 21;
      _x = x * Math.cos(b) + y * Math.sin(i);
      _y = x * Math.sin(b) + y * Math.cos(i);
      b = (j*22) * Math.PI / 23;
      $.arc(w / 2 + _x, h / 2 + _y, 0.8, 0, 2 * Math.PI);
    }
    $.stroke();
  }
  t += _t;
  u-=.2;
};
anim();

window.addEventListener('resize', function() {
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
}, false);