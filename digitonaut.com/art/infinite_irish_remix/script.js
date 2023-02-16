var canvas;
var stage;
var container;
var captureContainers;
var captureIndex;
var colorIndex = Math.random() * 360;

function init() {
  // create a new stage and point it at our canvas:
  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var w = canvas.width;
  var h = canvas.height;

  container = new createjs.Container();
  stage.addChild(container);

  captureContainers = [];
  captureIndex = 0;

  // create a large number of slightly complex vector shapes, and give them random positions and velocities:
  var shadow = new createjs.Shadow("#000", 2,2,5);
  var scale = 0.5;
  
  for (var i = 0; i < 50; i++) {
    var heart = new createjs.Container();   
    var h1 = new createjs.Shape();
    heart.colorCmd = h1.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*100+colorIndex-50, 100, 30 + Math.random() * 30)).command;
     h1.graphics.p("AjUUYQB9iGA3iwQCAmdgrm1QgKDCg0C7QhBDqizCkQiZCLjJggQhAgKgjg2QiYjoBbkdQghAKghgHQiggbhrh5QiYitBrjIQBOiUChg1QFBhpE+CBQhMgvhKg0QjFiNh5jUQh7jYCSjVQAfguA1gRQD0hJDaChQAMgtAbglQBah6CUgnQDqg+B0DSQBEB7gQCKQgoFMjmD9QBJg7BNgyQDGiCDsARQDJAQB0CiQBABZgXBpQg1DwjpBzQA4BFAmBPQBACFgXCRQgVCChxBGQjeCLjYifQkFjBhik+QALBFAGBEQAnG5iDGnQgSA8gzAcQgoAWgjAAQg2AAgqg4g")
    h1.shadow = shadow;
    h1.scale = scale;
    heart.addChild(h1);
    heart.cache(-160*scale,-160*scale,320*scale,320*scale,0.5);
    heart.y = -50;

    container.addChild(heart);
  }
  stage.canvas.style.backgroundColor = createjs.Graphics.getHSL(colorIndex, 100, 10);

  for (i = 0; i < 8; i++) {
    var captureContainer = new createjs.Container();
    captureContainer.cache(0, 0, w, h);
    captureContainers.push(captureContainer);
  }

  // start the tick and point it at the window so we can do some work before updating the stage:
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", tick);
  
  stage.on("stagemouseup", function() {
    //olorIndex = Math.random() * 360 | 0;
  });
}

function tick(event) {
  var w = canvas.width;
  var h = canvas.height;
  var l = container.numChildren;

  captureIndex = (captureIndex + 1) % captureContainers.length;
  stage.removeChildAt(0);
  var captureContainer = captureContainers[captureIndex];
  stage.addChildAt(captureContainer, 0);
  captureContainer.addChild(container);

  // iterate through all the children and move them according to their velocity:
  for (var i = 0; i < l; i++) {
    var heart = container.getChildAt(i);
    if (heart.y <= -50) {
      heart._x = Math.random() * w;
      heart.y = h * (1 + Math.random()) + 50;
      heart.perX = (1 + Math.random() * 2) * h;
      heart.offX = Math.random() * h;
      heart.ampX = heart.perX * 0.1 * (0.15 + Math.random());
      heart.velY = -Math.random() * 2 - 1;
      heart.scale = Math.random() * 0.3 + 0.2;
      heart._rotation = Math.random() * 40 - 20;
    }
    var int = (heart.offX + heart.y) / heart.perX * Math.PI * 2;
    heart.y += heart.velY * (1-heart.scaleX)*3.5;
    heart.x = heart._x + Math.cos(int) * heart.ampX;
    heart.rotation = heart._rotation + Math.sin(int) * 30;
  }

  captureContainer.updateCache("source-over");

  // draw the updates to stage:
  stage.update(event);
}

init();