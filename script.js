"use strict";

function game(){
	let c = document.getElementById("cnv");
	let cntx = c.getContext("2d"); 

	let textSpeed = document.getElementById("speed");
	let textDistance = document.getElementById("distance");

	let platform = new Object({ // платформа которой игрок отбивает шарик 
		x : c.width/2, 
		y : c.height * 4/5,
		color  : "#00FF00",
		height : 20,
		width : 100,
		moveStep : 8, // на сколько пикселей сдвинется платформа за 1 нажатие 
		periodRepaint : 1,
		clearPlatf : function(){
			platform.drawPlatf( "#FFFFFF", platform.height + 2 );
		},
		movingPlatf : function( left = true ){
			platform.clearPlatf();
			if( ball.atachedToPlatform )
				ball.clearBall();
			platform.x += left ? platform.moveStep : platform.moveStep * -1 ; // сдвиг
			platform.drawPlatf(); // рисование в новом месте
			if( ball.atachedToPlatform )
				ball.atachedBall();
		},
		drawPlatf : function( color, height ){
			cntx.beginPath();
			cntx.moveTo(platform.x-platform.width/2,platform.y);
			cntx.lineTo(platform.x+platform.width/2,platform.y);
			cntx.strokeStyle= color || platform.color;
			cntx.lineCap = "round";
			cntx.lineWidth = height || platform.height;
			cntx.stroke();
		}
	});

	var ball = new Object({
		x : -9999, // -9999 чтобы случайно не зачистить нужное поле в вызове atachedBall()
		y : -9999,
		radius : 10,
		color : "#FF0000",
		atachedToPlatform : true,
		vX : 2,
		vY : -2,
		prevX : 0,
		prevY : 0,
		prevTime : 0,
		distance : 0,
		periodRepaint : 10,
		movingBall : function(){
			ball.clearBall();
			( ball.x - ball.radius + ball.vX > 0 && ball.x + ball.radius + ball.vX < c.width ) || ( ball.vX *= -1 ); // отбивание от стенок
			ball.y - ball.radius + ball.vY > 0 || ( ball.vY *= -1 );

			if( ball.y + ball.radius + ball.vY > platform.y - platform.height/2 
				&& ball.y - ball.radius - ball.vY < platform.y
				&& ball.x + ball.radius  > platform.x - platform.width/2 
				&& ball.x - ball.radius < platform.x + platform.width/2  ) // 
				ball.vY *= -1
			else if( ball.y > c.height * 1.1 )
				ball.atachedToPlatform = true;
			
			if( ! ball.atachedToPlatform ) {
				ball.prevX = ball.x;
				ball.prevY = ball.y;
				ball.x += ball.vX;
				ball.y += ball.vY;
				ball.drawBall();
				setTimeout( ball.movingBall, ball.periodRepaint ); 
			} else {
				ball.atachedBall();
			}
			ball.distance = Math.sqrt( (ball.x - ball.prevX) ** 2 + (ball.y - ball.prevY) ** 2 ) ;
			textDistance.innerHTML = ball.distance ;
			textSpeed.innerHTML = ball.distance / ball.periodRepaint ;

		},
		clearBall : function(){
			ball.drawBall( "#FFFFFF", ball.radius + 1);
		},
		atachedBall : function(){
			ball.x = platform.x;
			ball.y = platform.y - platform.height/2 - ball.radius * 1.1;
			ball.drawBall();
		},
		drawBall : function( color, radius ){
			cntx.beginPath();
			cntx.arc(ball.x,ball.y, radius || ball.radius ,0,2*Math.PI,false);
			cntx.fillStyle = color || ball.color;
			cntx.fill();
		}
	});

	// Первая прорисовка
	platform.drawPlatf();
	ball.atachedBall(); 

	function keyBehave(e){
		if( e.code == "ArrowLeft" ) {
			if( platform.x - 60 > 0 ) {
				platform.movingPlatf(false);
			}
		}
		if( e.code == "ArrowRight" ) {
			if( platform.x + 60 < c.width ) {
				platform.movingPlatf();
			}
		}
		if( e.code == "Space" ) {
			if( ball.atachedToPlatform )
			{
				ball.atachedToPlatform = false;
				setTimeout( ball.movingBall, ball.periodRepaint );
			}
		}
	}

	document.addEventListener("keydown",keyBehave);
	
}

game();





