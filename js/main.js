var canvas = document.getElementById('canvas'),
    body = document.getElementById('body'),
    ctx = canvas.getContext('2d'),
    cw = canvas.width,
    width = canvas.width,
    ch = canvas.height,
    height = canvas.height,
    letters = " abcdefghijklmnopqrstuvwxyz",
    numbers = "0123456789",
    firstHit = false,
    noMorePoints = false,
    counter = 0;
    minSize = 18;
var name,numerics,mode,n,ni;
var buffer,b_ctx,bufferData;

var rects = [],
	pointsX = [],
    pointsY = [];
start();

var form = document.getElementById('form'),
	downloadbutton = document.getElementById('download');
if (form.attachEvent) {
    form.attachEvent("submit", processForm);
} else {
    form.addEventListener("submit", processForm);
}

function start() {
	var bufferImg = new Image();
	bufferImg.onload = function() {
    	buffer = document.createElement('canvas');
	    buffer.height = bufferImg.height;
	    buffer.width = bufferImg.width+2;
	    b_ctx = buffer.getContext('2d');
	    b_ctx.drawImage(bufferImg, 0, 0,buffer.width,buffer.height);
    };
    bufferImg.src = "img/buffer.png";
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();
    name = document.getElementById("formName").value,
    numerics = document.getElementById("formNumbers").value;
    mode = document.getElementById("formMode").value;

    if(downloadbutton.classList.contains('disabled')) downloadbutton.classList.remove('disabled');
    
    //add loading flag
    draw(mode,name,numerics);

    return false;
}

function draw(mode,name,numerics) {
    rects = [],
    pointsX = [],
    pointsY = [],
	firstHit = false,
    noMorePoints = false,
	nameClean = name.toLowerCase().replaceAll(" ",""),
	nameLetters = Array.from(nameClean),
    n = Array.from(numerics),
    ni = 0,
	minMaxSize = getMaxLetter(nameClean, nameLetters)*3;
    if(minMaxSize < minSize) minMaxSize = minSize*1.5;
  	maxSize = addNameLetters(nameClean, nameLetters)*3;
    if(maxSize < minSize) minMaxSize = minSize*2;
  	//console.log("maxSize: " + maxSize);
  	//console.log("minMaxSize: " + minMaxSize);
  	currMode = mode;

	ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cw, ch);

    //create boxes
    // for(var i = 0; i < 500; i ++) {
    while(!firstHit || !noMorePoints) {
        getRects();
    }

	//do text
    drawText(currMode,name);

    document.getElementById('submitButton').value="Re-Generate Card";
}

function getRects() {
	//console.log("get Rects");
	if(!firstHit) {
	    currX = randomInt((width/2)-100,(width/2)+100);
	    currY = randomInt((height/2)-100,(height/2)+100);
	} else {
	    if(pointsX.length > 0) {
	    	currX = Math.round(pointsX[0]);
	    	currY = Math.round(pointsY[0]);
	    	pointsX.shift();
            pointsY.shift();
            //console.log("currPoint: " + currX + "," + currY);
	    } else {
            noMorePoints = true;
            return false;
        }
	}
  
	if(hitTarget(currX,currY)) {
	    if(!firstHit) firstHit = true;    
	    getZone(currX,currY,1,1);
	    getZone(currX,currY,-1,-1);
	    getZone(currX,currY,1,-1);
	    getZone(currX,currY,-1,1);
	}
    //console.log("points left:" + pointsX.length);
}

function getZone(x, y, dirX, dirY) {
	var maxSizeX = randomInt(minMaxSize,maxSize),
  		maxSizeY = randomInt(minMaxSize,maxSize),
  		sizeX = dirX,
  		sizeY = dirY,
		hit = true;

	//console.log("horz axis");
	//do horz axis
	while (hit == true) {
	    hit = hitTarget(x+sizeX,y);
	    //check if overlaps
	    for(var r = 0; r < rects.length; r++) {
	        if(rects[r].intersect(x,y,x+sizeX,y+sizeY) == true) {
	        	hit = false;
	        	sizeX-=dirX;
	        	break;
	        }
	    }
	    // hit = false; //temp
	    if (hit) sizeX+=dirX;
	}
  
	hit = true;
	//console.log("vert axis");
	//do vert axis
	while (hit == true) {
	    hit = hitTarget(x,y+sizeY);
	    //check if overlaps
	    for(var r = 0; r < rects.length; r++) {
	        if(rects[r].intersect(x,y,x+sizeX,y+sizeY) == true) {
	        	hit = false;
	        	sizeY-=dirY;
	        	break;
	        }
	    }
	    // hit = false; //temp
	    if (hit) sizeY+=dirY;
	}
  
	//constrain to maxSize
	if(Math.abs(sizeX) > maxSizeX) sizeX = maxSizeX * dirX;
	if(Math.abs(sizeY) > maxSizeY) sizeY = maxSizeY * dirY;
  
	//now check if its corner is in or out
	if(!hitTarget(x+sizeX,y+sizeY)) {
		hit = false;
		while(!hit) {
	    	sizeX-=dirX;
	    	sizeY-=dirY;
	    	hit = hitTarget(x+sizeX,y+sizeY);
	    }
	}
  
	if(x+sizeX < 1) return;
	if(y+sizeY < 1) return;
	if(x+sizeX > width) return;
	if(y+sizeY > height) return;
  
 //  //lastly, check if large enough
  if(Math.abs(sizeX) >= minSize && Math.abs(sizeY) >= minSize) {
    
    //check if overlaps pre-existing rects
    var overlaps = false;
    for(var r = 0; r < rects.length; r++) {
      if(rects[r].intersect(x,y,x+sizeX,y+sizeY) == true) {
        //console.log("we have an overlap");
        overlaps = true;
        return;
      }
    }
    
	    if(!overlaps){
	    	rects.push(new Rect(x,y,x+sizeX,y+sizeY,currMode,n[ni]));
	    	//console.log("# of rects: " + rects.length);
	      
            //increment index
            ni++;
            if (ni > n.length-1) ni = 0;
	      
            //and add points to Set
            var p1x = x+sizeX,
                p1y = y+sizeY,
                p2x = x+sizeX,
                p2y = y,
                p3x = x,
                p3y = y+sizeY;

            if(!pointsX.indexOf(p1x) > -1 && !pointsY.indexOf(p1y) > -1) {
                // console.log("add p1");
                if(p1x < cw-40 && p1y < ch) {
                    pointsX.push(p1x);
                    pointsY.push(p1y); 
                }
            }
            if(!pointsX.indexOf(p2x) > -1 && !pointsY.indexOf(p2y) > -1) {
                // console.log("add p2");
                if(p2x < cw-40 && p2y < ch) {
                    pointsX.push(p2x);
                    pointsY.push(p2y);
                }
            }
            if(!pointsX.indexOf(p3x) > -1 && !pointsY.indexOf(p3y) > -1) {
                // console.log("add p3");
                if(p3x < cw-40 && p3y < ch) {
                    pointsX.push(p3x);
                    pointsY.push(p3y);
                }
            }
	    }
	}
}

function drawText(mode,name) {
	var nameString = "FOR " + name.toUpperCase(); 
	var modeString = "LOVE IS " + mode.toUpperCase(); 
	ctx.font = 'italic 40px "DIN Round W01 Regular"';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';
    ctx.save();
        ctx.translate(cw-40,60);
        ctx.rotate(Math.PI/2);
        ctx.font = 'italic 40px "DIN Round W01 Regular"';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
        ctx.fillText(nameString, 0, 0);
    ctx.restore();
    ctx.save();
        ctx.translate(40,ch-50);
        ctx.rotate((9*Math.PI)/6);
        ctx.font = 'italic 40px "DIN Round W01 Regular"';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
        ctx.fillText(modeString, 0, 0);
    ctx.restore();

}

function downloadCanvas(link, canvasId, filename) {
	if(!downloadbutton.classList.contains('disabled')) {
    	link.href = document.getElementById(canvasId).toDataURL();
    	link.download = filename;
	} else {
		return false;
	}
}

downloadbutton.addEventListener('click', function() {
    downloadCanvas(this, 'canvas', name+'-'+numerics);
}, false);

function randomInt(min,max) {
    return Math.floor((Math.random() * (max-min)) + min);
}

function randomFloat(min,max) {
    return (Math.random() * (max-min)) + min;
}

function hitTarget(x, y) {
	var i = (Math.round(y) * width) + Math.round(x);
	if (i/3 > (buffer.height*buffer.w) ) return false;
	if (i < 0) return false; 
	var p = b_ctx.getImageData(Math.floor(x/3), Math.floor(y/3), 1, 1).data;

	return (p[0] != 255);
}

function addNameLetters(name, nameLetters) {
  var value = 0;
  for (var n = 0; n < name.length; n++) {
    value += letters.indexOf(nameLetters[n]);
  }
  return value;
}

function getMinLetter(name, nameLetters) {
  var min = 26;
  for (var n = 0; n < name.length; n++) {
    if ( letters.indexOf(nameLetters[n]) < min ) min = letters.indexOf(nameLetters[n]);
  }
  return min;
}

function getMaxLetter(name, nameLetters) {
  var max = 1;
  for (var n = 0; n < name.length; n++) {
    if ( letters.indexOf(nameLetters[n]) >max ) max = letters.indexOf(nameLetters[n]);
  }
  return max;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function println(string) {
	console.log(string);
} 


/* Class for Rectangle */
function Rect (x1, y1, x2, y2, masterType, drawMode) {
  var minX,minY,maxX,maxY;
  var h,w;
  var masterType;
  var drawType;
  var highlight = "black";

  	//constructor
	this.getRectTypes(masterType,drawMode);
	//console.log(this.masterType);
	if(x1<x2) {
		this.minX = x1;
		this.maxX = x2;
	} else {
		this.minX = x2;
		this.maxX = x1;
	}

	if(y1<y2) {
		this.minY = y1;
		this.maxY = y2;
	} else {
		this.minY = y2;
		this.maxY = y1;
	}

    //console.log("rectangle’s maxY,minY: " + this.maxY + "," + this.minY);
    //console.log("rectangle’s maxX,minX: " + this.maxX + "," + this.minX);

	this.h = this.maxY - this.minY;
	this.w = this.maxX - this.minX;

    //console.log("rectangle’s w,h: " + this.w + "," + this.h);

    this.drawRectType();
    this.drawRect();
}

Rect.prototype.getRectTypes = function(master, draw) {
    if (master != "Everything") {
    	this.masterType = master;

        if (this.masterType == "Messy") {
            this.highlight = "#9900cc";
        }

        if (this.masterType == "Uplifting") {
            this.highlight = "#ff3333";
        }
        
    } else {
        this.highlight = "#ff0066";
     	var r = randomInt(0,3);
	    switch(r) {
	        case 0: this.masterType = "Messy";
	          break;
	        case 1: this.masterType = "Scary";
	          break;
	        case 2: this.masterType = "Uplifting";
	          break;
    	}
    }
    this.drawType = draw;
    //console.log("drawType:" + this.drawType);
};

Rect.prototype.intersect = function(x1, y1, x2, y2) {
    var localMinX,localMinY,localMaxX,localMaxY;
    
    if(x1<x2){
      localMinX = x1;
      localMaxX = x2;
    } else {
      localMinX = x2;
      localMaxX = x1;
    }
    
    if(y1<y2) {
      localMinY = y1;
      localMaxY = y2;
    } else {
      localMinY = y2;
      localMaxY = y1;
    }
    
    return this.maxX > localMinX &&
           this.minX < localMaxX &&
           this.maxY > localMinY &&
           this.minY < localMaxY;
};

Rect.prototype.drawRect = function() {
    // console.log("draw at: " + this.minX + "," + this.minY);
    // console.log("w,h: " + this.w + "," + this.h);
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    ctx.rect(this.minX,this.minY,this.w,this.h);
    ctx.stroke();
}

Rect.prototype.drawRectType = function() {
    // this.drawX();
    if(this.masterType == "Messy") {
        switch(parseInt(this.drawType)) {
            case 0: 
                break;
            case 1: this.drawOffCenterDiamond();
                break;
            case 2: this.drawNoise();
                break;
            case 3: this.drawSquiggle();
                break;
            case 4: this.drawWaves();
                break;
            case 5: this.drawDirtyDots();
                break;
            case 6: this.drawDiagonals();
                break;
            case 7: this.drawCenterDot();
                break;
            case 8: this.drawStepRepeat();
                break;
            case 9: this.drawCocentric();
                break;
        }
    } else if (this.masterType == "Scary") {
        switch(parseInt(this.drawType)) {
            case 0: this.drawBlack();
                break;
            case 1: this.drawA();
                break;
            case 2: this.drawV();
                break;
            case 3: this.drawX();
                break;
            case 4: this.drawHalf();
                break;
            case 5: this.drawDiagonal();
                break;
            case 6: this.drawTeeth();
                break;
            case 7: this.drawCrossDiamond();
                break;
            case 8: this.drawChevrons();
                break;
            case 9: this.drawDiagonals();
                break;
        }
    } else if (this.masterType == "Uplifting") {
        switch(parseInt(this.drawType)) {
            case 0: 
                break;
            case 1: this.drawBurst();
            break;
            case 2: this.drawPlateau();
            break;
            case 3: this.drawCrossDiamond();
            break;
            case 4: this.drawRows();
            break;
            case 5: this.drawCenterDiamond();
            break;
            case 6: this.drawEqTri();
            break;
            case 7: this.drawHalf();
            break;
            case 8: this.drawDiagonal();
            break;
            case 9: this.drawArc();
            break;
            }
    }
}
Rect.prototype.drawA = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    line(this.minX,this.maxY,(this.minX + this.w/2),this.minY); 
    line((this.minX + this.w/2),this.minY,this.maxX,this.maxY); 
    ctx.stroke();
}

Rect.prototype.drawArc = function() {    
    if (this.h>this.w) { 
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="black";
        ctx.ellipse(this.minX+(this.w/2),this.maxY,this.w/2,this.h/4,0,-Math.PI,0,false);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="black";
        ctx.ellipse(this.minX+(this.w/2),this.minY,this.w/2,this.h/4,0,0,Math.PI,false);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="black";
        ctx.ellipse(this.maxX,this.minY+(this.h/2),this.w/4,this.h/2,0,Math.PI/2,3*Math.PI/2,false);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="black";
        ctx.ellipse(this.minX,this.minY+(this.h/2),this.w/4,this.h/2,0,-Math.PI/2,Math.PI/2,false);
        ctx.stroke();
    }
  
}

Rect.prototype.drawBlack = function() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.minX,this.minY,this.w,this.h);
}

Rect.prototype.drawBurst = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";

    var r = randomInt(0,4);
    switch(r) {
        case 0: //top left
            if(this.h > 10 && this.w > 10){
                line(this.minX,this.minY,this.maxX,this.minY+(this.h*.25));
                line(this.minX,this.minY,this.maxX,this.minY+(this.h*.75));
                line(this.minX,this.minY,this.minX+(this.w*.75),this.maxY);
                line(this.minX,this.minY,this.minX+(this.w*.25),this.maxY);
            } 
            line(this.minX,this.minY,this.maxX,this.minY+this.h/2);
            line(this.minX,this.minY,this.maxX,this.maxY);
            line(this.minX,this.minY,this.minX+this.w/2,this.maxY);
            break;
        case 1: //top right
            if(this.h > 10 && this.w > 10) {
                line(this.maxX,this.minY,this.minX,this.minY+(this.h*.25));
                line(this.maxX,this.minY,this.minX,this.minY+(this.h*.75));
                line(this.maxX,this.minY,this.minX+(this.w*.25),this.maxY);
                line(this.maxX,this.minY,this.minX+(this.w*.75),this.maxY);
            }
            line(this.maxX,this.minY,this.minX,this.minY+this.h/2);
            line(this.maxX,this.minY,this.minX,this.maxY);
            line(this.maxX,this.minY,this.minX+this.w/2,this.maxY);
            break;
        case 2: //bottom left
            ctx.strokeStyle="black";
            if(this.h > 10 && this.w > 10) {
                line(this.minX,this.maxY,this.maxX,this.minY+this.h*.25);
                line(this.minX,this.maxY,this.maxX,this.minY+this.h*.75);
                line(this.minX,this.maxY,this.minX+this.w*.25,this.minY);
                line(this.minX,this.maxY,this.minX+this.w*.75,this.minY);
            }
            line(this.minX,this.maxY,this.maxX,this.minY+this.h/2);
            line(this.minX,this.maxY,this.maxX,this.minY);
            line(this.minX,this.maxY,this.minX+this.w/2,this.minY);
            break;
        case 3: //bottom right
            if(this.h > 10 && this.w > 10) {
                line(this.maxX,this.maxY,this.minX,this.minY+this.h*.25);
                line(this.maxX,this.maxY,this.minX,this.minY+this.h*.75);
                line(this.maxX,this.maxY,this.minX+this.w*.25,this.minY);
                line(this.maxX,this.maxY,this.minX+this.w*.75,this.minY);
            }
            line(this.maxX,this.maxY,this.minX,this.minY+this.h/2);
            line(this.maxX,this.maxY,this.minX,this.minY);
            line(this.maxX,this.maxY,this.minX+this.w/2,this.minY);
            break;
    }

    ctx.stroke();
}

Rect.prototype.drawCenterDiamond = function() {    
    var c = (this.h>this.w) ? this.w/4 : this.h/4;
    ctx.save();
        ctx.translate((this.minX+this.w/2),(this.minY+this.h/2)-(c/1.8));
        ctx.rotate(Math.PI/4);
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle = this.highlight;
        ctx.rect(0,0,c,c);
        ctx.stroke();
    ctx.restore();
}

Rect.prototype.drawCocentric = function() {

    if(this.h>this.w) {
        var r = Math.floor(this.w/4);
      
        for(var i = r; i < this.h; i+=r){
            if(i < this.w) {
                var start = 0;
                ctx.beginPath();
                ctx.lineWidth="3";
                ctx.strokeStyle = "black";
                ctx.ellipse(this.minX,this.minY,i,i,0,start,Math.PI/2,false);
                //arc(minX,minY,(i*2),(i*2),start,PI/2);
                ctx.stroke();
            } else {
                var start = Math.acos(this.w/i);
                ctx.beginPath();
                ctx.lineWidth="3";
                ctx.strokeStyle = "black";
                ctx.ellipse(this.minX,this.minY,i,i,0,start,Math.PI/2,false);
                //arc(minX,minY,(i*2),(i*2),start,PI/2);
                ctx.stroke();
            }
        }
    } else {
        var r = this.h/4;

        for(var i = r; i < this.w; i+=r){
            var start = 0;
            if(i < this.h) {
                ctx.beginPath();
                ctx.lineWidth="3";
                ctx.strokeStyle = "black";
                ctx.ellipse(this.minX,this.minY,i,i,0,start,Math.PI/2,false);
                //arc(minX,minY,(i*2),(i*2),start,PI/2);
                ctx.stroke();
            } else {
                start = Math.asin(this.h/i);
                ctx.beginPath();
                ctx.lineWidth="3";
                ctx.strokeStyle = "black";
                ctx.ellipse(this.minX,this.minY,i,i,0,0,start,false);
                //arc(minX,minY,(i*2),(i*2),0,start);
                ctx.stroke();
            }
        }
    }
}

Rect.prototype.drawCenterDot = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle = this.highlight;
    var c = (this.h>this.w) ? this.w/4 : this.h/4;
    ctx.ellipse((this.minX+this.w/2),(this.minY+this.h/2),c,c,0, 2 * Math.PI, false)
    ctx.stroke();
}

Rect.prototype.drawCrossDiamond = function() {
    this.drawA();
    this.drawV();
}

Rect.prototype.drawChevrons = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";

    if(this.h>this.w) {
        var stepInc = 4,
            step = this.w/stepInc;
        if(step < 3) step = 3;
            //down
            for(var y = -step*2; y < this.h; y+=step) {
                if(this.minY+y < this.minY) {
                    var midY = y+this.w/2;
                    line(this.minX+midY,this.minY,this.minX+this.w/2,this.minY+midY);
                    line(this.minX+this.w/2,this.minY+midY,this.maxX-midY,this.minY);
                } else if(this.minY+y+this.w/2 < this.maxY) {
                    line(this.minX,this.minY+y,this.minX+this.w/2,this.minY+y+this.w/2);
                    line(this.minX+this.w/2,this.minY+y+this.w/2,this.maxX,this.minY+y);
                } else {
                    var tempH = (this.h-y);
                    line(this.minX,this.minY+y,this.minX+tempH,this.minY+y+tempH);
                    line(this.maxX-tempH,this.minY+y+tempH,this.maxX,this.minY+y);
                }
            }
    } else {
      
        var stepInc = 4,
            step = this.h/stepInc;
        //across
        for(var x = -step*2; x < this.w; x+=step) {
            if(this.minX+x < this.minX) {
                var midX = x+this.h/2;          
                line(this.minX,this.minY+midX,this.minX+midX,this.minY+this.h/2);
                line(this.minX+midX,this.minY+this.h/2,this.minX,this.maxY-midX);

            } else if(this.minX+x+this.h/2 < this.maxX) {
                line(this.minX+x,this.minY,this.minX+x+this.h/2,this.minY+this.h/2);
                line(this.minX+x+this.h/2,this.minY+this.h/2,this.minX+x,this.maxY);
            } else {
                var tempW = (this.w-x);
                line(this.minX+x,this.minY,this.minX+x+tempW,this.minY+tempW);
                line(this.minX+x+tempW,this.maxY-tempW,this.minX+x,this.maxY);
            }
        }
    }

    ctx.stroke();
}

Rect.prototype.drawDiagonal = function() {
    var r = Math.random(0,1);
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    if (r < .5) { 
      line(this.minX,this.minY,this.maxX,this.maxY);
    } else {
      line(this.minX,this.maxY,this.maxX,this.minY);
    } 
    ctx.stroke();
}

Rect.prototype.drawDiagonals = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    
    if(this.h>this.w) {
      var spacing = (this.w/4> 4) ? this.w/4 : this.w/2;
      if(spacing < 3) spacing = 3;
      //down
      for(var y = this.minY; y<this.maxY; y+=spacing) {
        if(y+this.w < this.maxY){
          line(this.minX,y,this.minX+this.w,y+this.w);
        } else {
          var tempW = (this.maxY - y);
          line(this.minX,y,this.minX+tempW,y+tempW);
        }
      }
      //across
      for(var x = this.minX; x<this.maxX; x+=spacing) {
        var tempW = (this.maxX - x);
        line(x,this.minY,x+tempW,this.minY+tempW);
      }
    } else {
      var spacing = (this.h/4> 4) ? this.h/4 : this.h/2;
      if(spacing < 3) spacing = 3;
      //across
      for(var x = this.minX; x<this.maxX; x+=spacing) {
        if(x+this.h < this.maxX){
          line(x,this.minY,x+this.h,this.minY+this.h);
        } else {
          var tempH = (this.maxX - x);
          line(x,this.minY,x+tempH,this.minY+tempH);
        }
      }
      //down
      for(var y = this.minY; y<this.maxY; y+=spacing) {
        var tempW = (this.maxY - y);
        line(this.minX,y,this.minX+tempW,y+tempW);
      }
    }

    ctx.stroke();
}

Rect.prototype.drawDirtyDots = function() {

    var n = Math.round(this.h*this.w/600),
        bzr = 0.552284749831;
    for(var i = 0; i < n+1; i++) {
        var x = randomInt(this.minX,this.maxX),
            y = randomInt(this.minY,this.maxY),
            r = (this.h>this.w) ? randomInt(2,this.w/6) : randomInt(2,this.h/6);
      
        //this is a perfect circle
        //beginShape();
        //  vertex(x+r,y); 
        //  bezierVertex(x+r, y+(r*bzr), x+(r*bzr), y+r, x, y+r);
        //  bezierVertex(x-(r*bzr), y+r, x-r, y+(r*bzr), x-r, y);
        //  bezierVertex(x-r, y-(r*bzr), x-(r*bzr), y-r, x, y-r);
        //  bezierVertex(x+(r*bzr), y-r, x+r, y-(r*bzr), x+r, y);
        //endShape(CLOSE);
      
        //this is a messy circle
        var div = 20, // the lower this is the messier it is
            startX = randomInt(-r/div,r/div);
            startY = randomInt(-r/div,r/div);
        
        ctx.beginPath();
        ctx.lineWidth="3";
        ctx.strokeStyle="black";
        // vertex(x+r+startX,y+startY); 
        // bezierVertex(x+r+random(-r/div,r/div), y+(r*bzr)+random(-r/div,r/div), x+(r*bzr)+random(-r/div,r/div), y+r+random(-r/div,r/div), x+random(-r/div,r/div), y+r+random(-r/div,r/div));
        // bezierVertex(x-(r*bzr)+random(-r/div,r/div)+random(-r/div,r/div), y+r+random(-r/div,r/div), x-r+random(-r/div,r/div), y+(r*bzr)+random(-r/div,r/div), x-r+random(-r/div,r/div), y+random(-r/div,r/div));
        // bezierVertex(x-r+random(-r/div,r/div), y-(r*bzr)+random(-r/div,r/div), x-(r*bzr)+random(-r/div,r/div), y-r+random(-r/div,r/div), x+random(-r/div,r/div), y-r+random(-r/div,r/div));
        // bezierVertex(x+(r*bzr)+random(-r/div,r/div), y-r+random(-r/div,r/div), x+r+random(-r/div,r/div), y-(r*bzr)+random(-r/div,r/div), x+r+startX+random(-r/div,r/div), y+startY+random(-r/div,r/div));
        // endShape(CLOSE);
        ctx.moveTo(x+r+startX,y+startY);
        ctx.bezierCurveTo(x+r+randomFloat(-r/div,r/div), y+(r*bzr)+randomFloat(-r/div,r/div), x+(r*bzr)+randomFloat(-r/div,r/div), y+r+randomFloat(-r/div,r/div), x+randomFloat(-r/div,r/div), y+r+randomFloat(-r/div,r/div));
        ctx.bezierCurveTo(x-(r*bzr)+randomFloat(-r/div,r/div)+randomFloat(-r/div,r/div), y+r+randomFloat(-r/div,r/div), x-r+randomFloat(-r/div,r/div), y+(r*bzr)+randomFloat(-r/div,r/div), x-r+randomFloat(-r/div,r/div), y+randomFloat(-r/div,r/div));
        ctx.bezierCurveTo(x-r+randomFloat(-r/div,r/div), y-(r*bzr)+randomFloat(-r/div,r/div), x-(r*bzr)+randomFloat(-r/div,r/div), y-r+randomFloat(-r/div,r/div), x+randomFloat(-r/div,r/div), y-r+randomFloat(-r/div,r/div));
        ctx.bezierCurveTo(x+(r*bzr)+randomFloat(-r/div,r/div), y-r+randomFloat(-r/div,r/div), x+r+randomFloat(-r/div,r/div), y-(r*bzr)+randomFloat(-r/div,r/div), x+r+startX+randomFloat(-r/div,r/div), y+startY+randomFloat(-r/div,r/div));
        
        ctx.stroke();
    }
    
}

Rect.prototype.drawEqTri = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    
    if(this.h>this.w) {
        var sh = Math.sqrt(sq(this.w) - sq(this.w/2)) *.66;
        if(sh+sh > this.h) sh=sh*.66;
        //top
        line(this.minX,this.minY,this.minX+this.w/2,this.minY+sh);
        line(this.minX+this.w/2,this.minY+sh,this.maxX,this.minY);
        //centerline
        line(this.minX+this.w/2,this.minY+sh,this.minX+this.w/2,this.maxY-sh);
        //bottom
        line(this.minX,this.maxY,this.minX+this.w/2,this.maxY-sh);
        line(this.minX+this.w/2,this.maxY-sh,this.maxX,this.maxY);
    } else {
        var sh = Math.sqrt(sq(this.h) - sq(this.h/2)) *.66;
        if(sh+sh > this.w) sh=sh*.66;
        //left
        line(this.minX,this.minY,this.minX+sh,this.minY+this.h/2);
        line(this.minX+sh,this.minY+this.h/2,this.minX,this.maxY);
        //center
        line(this.minX+sh,this.minY+this.h/2,this.maxX-sh,this.minY+this.h/2);
        //right
        line(this.maxX,this.minY,this.maxX-sh,this.minY+this.h/2);
        line(this.maxX-sh,this.minY+this.h/2,this.maxX,this.maxY);
    }

    ctx.stroke();
}

Rect.prototype.drawHalf = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    var r = Math.random(0,1);
    if (r < .5) { 
      line(this.minX,this.minY+this.h/2,this.maxX,this.minY+this.h/2);
    } else {
      line(this.minX+this.w/2,this.maxY,this.minX+this.w/2,this.minY);
    }
    ctx.stroke();
}

Rect.prototype.drawNoise = function() {

    var r = randomInt(20,60),
        d = 1,
        p = this.w*this.h/r;

    for(var i = 0; i < p; i++) {
        var x = Math.round(this.minX + randomInt(0,this.w)),
            y = Math.round(this.minY + randomInt(0,this.h));

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.ellipse(x, y, 2, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}


Rect.prototype.drawOffCenterDiamond = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    var x = this.minX + (this.w*.125) + randomFloat(0,this.w*.75);
    var y = this.minY + (this.h*.125) + randomFloat(0,this.h*.75);
    line(this.minX,this.minY,x,y);
    line(this.maxX,this.minY,x,y);
    line(this.maxX,this.maxY,x,y);
    line(this.minX,this.maxY,x,y);
    ctx.stroke();
}

Rect.prototype.drawOffcenterEq = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    if(this.h>this.w) {
        var x = (this.w*.25) + randomFloat(0,this.w*.5),
            y = randomFloat(this.h*.125,this.h*.4);
        line(this.minX,this.minY,this.minX+x,this.minY+y);
        line(this.minX+x,this.minY+y,this.maxX,this.minY);
        line(this.minX+x,this.minY+y,this.minX+x,this.maxY-y);
        line(this.minX,this.maxY,this.minX+x,this.maxY-y);
        line(this.minX+x,this.maxY-y,this.maxX,this.maxY);
    } else {
        var x = randomFloat(this.w*.125,this.w*.4),
            y = (this.h*.25) + randomFloat(0,this.h*.5);
        line(this.minX,this.minY,this.minX+x,this.minY+y);
        line(this.minX+x,this.minY+y,this.minX,this.maxY);
        line(this.minX+x,this.minY+y,this.maxX-x,this.minY+y);
        line(this.maxX,this.minY,this.maxX-x,this.minY+y);
        line(this.maxX-x,this.minY+y,this.maxX,this.maxY);
    }
    ctx.stroke();
}

    

Rect.prototype.drawPlateau = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    var inset = (this.h>this.w) ? this.w/6 : this.h/6 ;
    if (inset < 5) inset = 5;
    ctx.rect(this.minX+inset,this.minY+inset,this.w-(inset*2),this.h-(inset*2));
    line(this.minX,this.minY, this.minX+inset,this.minY+inset);
    line(this.maxX,this.minY, this.maxX-inset,this.minY+inset);
    line(this.maxX,this.maxY, this.maxX-inset,this.maxY-inset);
    line(this.minX,this.maxY, this.minX+inset,this.maxY-inset);
    ctx.stroke();
}

Rect.prototype.drawRows = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";

    var spacing, 
        d;
    if (this.h>this.w) { 
      spacing = this.w/9;
      d = this.h/spacing;
      for(var y = d; y < this.h; y+=d) {
        line(this.minX,this.minY+y,this.maxX,this.minY+y);
      }
    } else {
      spacing = this.h/9;
      d = this.w/spacing;
      for(var x = d; x < this.w; x+=d) {
        line(this.minX+x,this.minY,this.minX+x,this.maxY);
      }
    }
    ctx.stroke();
}

Rect.prototype.drawSquiggle = function() {

    var ps = randomInt(5,9),
        px = [];
        py = [];

    for (var p = 0; p < ps; p++) {
        px.push(randomInt(this.minX,this.maxX));
        py.push(randomInt(this.minY,this.maxY));
    }

    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";

    // move to the first point
    ctx.moveTo(px[0], py[0]);

    for (i = 1; i < px.length - 2; i ++) {
        var xc = (px[i] + px[i+1]) / 2;
        var yc = (py[i] + py[i+1]) / 2;
        ctx.quadraticCurveTo(px[i], py[i], xc, yc);
    }
    // curve through the last two points
    ctx.quadraticCurveTo(px[i], py[i], px[i+1],py[i+1]);

    ctx.stroke();
}

Rect.prototype.drawStepRepeat = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    
    var r = 9;
    if(this.h > this.w) {
      for(var i = 1; i*r < (this.w/2); i++) {
        ctx.rect(this.minX+i*r,this.minY+i*r,this.w-(i*r*2),this.h-(i*r*2));
      }
    } else {
      for(var i = 1; i*r < (this.h/2); i++) {
        ctx.rect(this.minX+i*r,this.minY+i*r,this.w-(i*r*2),this.h-(i*r*2));
      }
    }
    ctx.stroke();
}

  
    


Rect.prototype.drawTeeth = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";

    if(this.h>this.w) {
        var sh = this.w/3,
            spacing = sh/4,
            modH = sh+(spacing*2),
            start = (this.h%modH)/2;
        for(var y = start; y < (this.h-sh); y+=modH){
            var startY = y + spacing;
            line(this.minX+(this.w*.25),this.minY+startY,this.minX+(this.w*.75),this.minY+startY);
            line(this.minX+(this.w*.25),this.minY+startY,this.minX+(this.w*.5),this.minY+startY+sh);
            line(this.minX+(this.w*.5),this.minY+startY+sh,this.minX+(this.w*.75),this.minY+startY);
        }
    } else {
        var sh = this.h/3,
            spacing = sh/4,
            modW = sh+(spacing*2),
            start = (this.w%modW)/2,
            startY = (this.h - sh)/2;
            for(var x = start; x < (this.w-sh); x+=modW){
                var startX = x + spacing;
                line(this.minX+startX,this.minY+startY,this.minX+startX+sh,this.minY+startY);
                line(this.minX+startX,this.minY+startY,this.minX+startX+sh/2,this.minY+startY+sh);
                line(this.minX+startX+sh/2,this.minY+startY+sh,this.minX+startX+sh,this.minY+startY);
            }
    }

    ctx.stroke();
}

Rect.prototype.drawV = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    line(this.minX,this.minY,(this.minX + this.w/2),this.maxY); 
    line((this.minX + this.w/2),this.maxY,this.maxX,this.minY);
    ctx.stroke();
}

Rect.prototype.drawWaves = function() {

    var x,y,degree;

    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle= this.highlight;
    
    
        var numOfWaves = 3.0,
            period = this.w,
            amp = this.w/6,
            inc = (this.w > 20) ? amp : amp*4 ;
      
        for(var yi = -inc; yi < this.h; yi+=inc ) {
            var startX = this.minX,
                startY = this.minY + amp + yi,
                prevX=startX, prevY=startY,
                angle = 0;
            
            for(var count=0; count < this.w; count++) {
                x = count;
              
                degree = mapTo(count,0,this.w,0,360);
              
                angle = Math.radians(degree);
                y = Math.sin(angle*(numOfWaves/2.0));
              
                y = mapTo(y,-1,1,-amp,amp);
              
                if(prevY< this.maxY && prevY > this.minY) {
                    line(prevX, prevY, startX+x, startY+y);
                }
              
                prevX = startX+x;
                prevY = startY+y;
            }
          
            prevX = startX;
            prevY = startY;
            angle = 0;
        }
    

    ctx.stroke();
}


Rect.prototype.drawX = function() {
    ctx.beginPath();
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    line(this.minX,this.minY,this.maxX,this.maxY);
    line(this.maxX,this.minY,this.minX,this.maxY);
    ctx.stroke();
}

function line(x1,y1,x2,y2) {
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
}

function Vector (x, y) {
    this.x = x;
    this.y = y;
}

function sq(val) {
    return val*val;
}

function mapTo(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};





