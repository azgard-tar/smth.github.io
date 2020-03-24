"use strict"; // строгий режим - использование новых стандартов языка

// Главная функция игры. Без использование глобальных переменных. 
function game(){

	// Связь с html
	// {
		let c = document.getElementById("cnv"); // наш канвас 
		if( document.documentElement.clientHeight > document.documentElement.clientWidth )
			c.height = c.width = document.documentElement.clientWidth - 100;
		else
			c.height = c.width = document.documentElement.clientHeight - 100;
		let cntx = c.getContext("2d"); // контекст - набор инструментов( функций ) рисования для 2d графики
	// }


	let levels = [[ 
			[1,0,0,0,0,0,1],
			[0,1,0,0,0,1,0],
			[0,0,1,0,1,0,0],
			[0,0,0,1,0,0,0],
			[0,0,1,0,1,0,0],
			[0,1,0,0,0,1,0],
			[1,0,0,0,0,0,1]
			],[ 
			[0,0,0,1,0,0,0],
			[1,0,1,1,1,0,1],
			[0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0],
			[0,0,0,1,0,0,0]
			],[ 
			[0,0,0,0,0,0,0],
			[0,1,1,0,1,1,0],
			[0,1,1,0,1,1,0],
			[0,0,0,0,0,0,0],
			[0,1,0,0,0,1,0],
			[0,0,1,1,1,0,0],
			[0,0,0,0,0,0,0]
			],[ 
			[0,0,0,0,0,0,0],
			[0,0,1,0,1,0,0],
			[0,1,1,1,1,1,0],
			[0,1,1,1,1,1,0],
			[0,0,1,1,1,0,0],
			[0,0,0,1,0,0,0],
			[0,0,0,0,0,0,0]
			],[ 
			[0,0,0,0,0,0,0],
			[0,0,0,1,0,0,0],
			[0,0,1,1,1,0,0],
			[0,1,1,1,1,1,0],
			[1,1,1,1,1,1,1],
			[0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0]
			]];
	let blocks = [];

	let platform = new Object({ // платформа которой игрок отбивает шарик 
		x : c.width * 13/32, 
		y : c.height * 4/5,
		color  : "#00FFFF",
		height : c.height/30,
		width : c.width/6,
		startWidth : c.width/6,
		startSpeed : c.width/200,
		speedIncr : c.width / 1500,
		widthIncr : c.width/60,
		speed : c.width/200, // на сколько пикселей сдвинется платформа за 1 нажатие 
		clearPlatf : function(){
			platform.drawPlatf( "#FFFFFF", platform.width + platform.speed * 2, platform.height + 3 , platform.x + -3 );
		},
		movingPlatf : function( left = true ){
			platform.clearPlatf();
			if( ball.atachedToPlatform )
				ball.clearBall();
			platform.x += left ? platform.speed : platform.speed * -1 ; // сдвиг
			platform.drawPlatf(); // рисование в новом месте
			if( ball.atachedToPlatform )
				ball.atachedBall();
		},
		drawPlatf : function( color, width,height, x){
			cntx.beginPath();
			if( width ) {
				cntx.rect(x, platform.y, width, height);
				cntx.fillStyle = color
			}
			else{
				cntx.rect(platform.x,platform.y, platform.width, platform.height);
				cntx.fillStyle = platform.color;	
			}
			cntx.fill();
		}
	});

	var ball = new Object({
		x : -9999, // -9999 чтобы случайно не зачистить нужное поле в вызове atachedBall()
		y : -9999,
		radius : c.width/60,
		color : "#FF0000",
		atachedToPlatform : true,
		vX : c.width/600,
		vY : -c.height/600,
		startV : c.width/600,
		speedIncr : c.width/6000,
		score : 0,
		isCollision : function(x1,y1,w1,h1,x2,y2,w2,h2){
			return ( x1 < x2 + w2 &&
					 x1 + w1 > x2 &&
					 y1 < y2 + h2 &&
					 y1 + h1 > y2 );
		},
		movingBall : function(){
			ball.clearBall();

			// отбивание от стенок
			( ball.x - ball.radius + ball.vX > 0 && ball.x + ball.radius + ball.vX < c.width ) || ( ball.vX *= -1 ); 
			ball.y - ball.radius + ball.vY > 0 || ( ball.vY *= -1 );

			// Просчет попадения в блок. Попробовать оптимизировать---------------------------------------------------------------------
			for( let bricks of blocks )
				for( let brick of bricks ){
					if( brick ){
						if( ball.isCollision( ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2, brick.x, brick.y, brick.width,brick.height ) ) {
							if(ball.vX > 0 && ball.x - ball.radius - ball.vX < brick.x || ball.vX < 0 && ball.x + ball.radius - ball.vX > brick.x + brick.width )
								ball.vX *= -1;
							else
								ball.vY *= -1;
							// Попали в блок
							brick.hitBlock(); // убираем его
							ball.score++; // Засчитываем попадение
							ball.vX > 0 ? ball.vX += ball.speedIncr : ball.vX -= ball.speedIncr; // увеличиваем скорость
							ball.vY > 0 ? ball.vY += ball.speedIncr : ball.vY -= ball.speedIncr;
							platform.speed += platform.speedIncr;
							platform.width += platform.widthIncr;
						}
					}
				}

			// Попадение в платформу
			if( ball.isCollision( ball.x - ball.radius + ball.vX , ball.y - ball.radius + ball.vY, ball.radius * 2, ball.radius * 2, platform.x, platform.y, platform.width,platform.height ) ) // вверх и низ платформы
				if(ball.vX > 0 && ball.x - ball.radius - ball.vX < platform.x || ball.vX < 0 && ball.x + ball.radius - ball.vX > platform.x + platform.width ) // право и лево платформы
					ball.vX *= -1;
				else
					ball.vY *= -1;
			else if( ball.score == block.prototype.countOfBlocks ) {
				alert( "Вы выиграли! И за это вы получаете целое ничего!\n Поздравляю! " ) ;
				Restart();
			}
			else if( ball.y > c.height * 1.1 ) { // мяч улетел вниз 
				Restart()
			}

			
			if( ! ball.atachedToPlatform ) { // физика движения 
				ball.x += ball.vX;
				ball.y += ball.vY;
				ball.drawBall();
				setTimeout( ball.movingBall, ball.periodRepaint ); 
			} else {
				ball.atachedBall(); // рестарт игры
			}

			writeScore( ball.score );

		},
		clearBall : function(){
			ball.drawBall( "#FFFFFF", ball.radius + 1);
		},
		atachedBall : function(){ // старт 
			ball.score = 0;
			ball.x = platform.x + platform.width/2;
			ball.y = platform.y - ball.radius * 1.1;
			ball.drawBall();
		},
		drawBall : function( color, radius ){
			cntx.beginPath();
			cntx.arc(ball.x,ball.y, radius || ball.radius ,0,2*Math.PI,false);
			cntx.fillStyle = color || ball.color;
			cntx.fill();
		}
	});

	function getRandomInt(max) {
	  return Math.floor(Math.random() * Math.floor(max));
	}

	function writeScore( value ){
		cntx.clearRect(0,0,100,25);
		cntx.font = "16pt Calibri";
		cntx.fillStyle =  "#00FF00" ;
		cntx.fillText( "Счет: " + value, 0, 20 ) ;
	}

	function Restart(){
		ball.atachedToPlatform = true; 
		block.prototype.countOfBlocks = 0;
		cntx.clearRect(0,0,c.width, c.height);
		blocks = createLevel(levels[getRandomInt(4) + 1]);
		platform.width = platform.startWidth;
		platform.speed = platform.startSpeed;
		ball.vX = ball.startV;
		ball.vY = ball.startV;
		Math.random() > 0.5 && ( ball.vX *= -1 );

		writeScore(0);
		platform.drawPlatf();
		ball.atachedBall(); 
		for( let oneRow of blocks )
			for( let oneBlock of oneRow )
				if( oneBlock )
					oneBlock.showBlock();
	}

	function block(x = 0, y = 0, width = c.width/10, height = c.height/30, hp = 1 ){ // конструктор блоков
		// Все эти параметри уникальны для каждого блока
		this.x = ( c.width/2 - width/2) + ( width + 5 ) * x; 
		this.y = ( c.height*1/5 - height/2 ) + ( height + 10) * y;
		this.width = width;
		this.height = height;
		this.maxHp = hp;
		this.currentHp = hp;
	}

	block.prototype.showBlock = function( ){ // функция в prototype - она одна для всех. Прорисовка блока
		cntx.clearRect( this.x - 2 , this.y - 2 , this.width + 4,this.height + 4 );
		if( this.currentHp > 0 ) {
			cntx.beginPath();
			cntx.rect( this.x , this.y, this.width,this.height );
			switch( this.currentHp ){
				case 1:
					cntx.fillStyle = "#FF0000";
				break;
				case 2:
					cntx.fillStyle = "#00FF00";
				break;
				case 3:
					cntx.fillStyle = "#0000FF";
				break;
			}
			cntx.fill();
			cntx.font = "12pt Calibri";
			cntx.fillStyle =  "#000000" ;
			cntx.fillText( this.currentHp, this.x + this.width*7/16, this.y + this.height*5/8);
		}
	}

	block.prototype.hitBlock = function(){ // отработка попадения в блок
		this.currentHp--;
		this.showBlock();
		if( this.currentHp == 0 ) // если жизней нет - get out from here!
		{
			this.x = -200;
			this.y = -200;
		}
		this.showBlock();
	}
	block.prototype.countOfBlocks = 0;

	//let blocks = [ new block(),new block(1),new block(-1) ]; // старая версия установки блоков
	
	function createLevel( array ){ // создает массив блоков на основе карты 
		let resArray = [[],[],[],[],[],[],[]];
		for( let i = -3, k = 0; k < 7; i++, k++ ){
			for( let j = -3, l = 0; l < 7; j++, l++ ){
				if( array[k][l] == 1 ){
					resArray[k][l] = new block(j,i);
					block.prototype.countOfBlocks++;
				}
			}
		}
		return resArray;
	}

	// главный функционал игры 
	var oneLoopGame = function(){
		if( isKeyDown("ArrowLeft") ) {
			if( platform.x> 0 ) {
				platform.movingPlatf(false);
			}
		}
		if( isKeyDown("ArrowRight") ) {
			if( platform.x + platform.width < c.width ) {
				platform.movingPlatf();
			}
		}
		if( isKeyDown("Space") ) {
			if( ball.atachedToPlatform )
			{
				ball.atachedToPlatform = false;
				ball.movingBall();
			}
		}
	}

	// Проработка нажатия клавиш
	var currentKeyDown = "";

	var isKeyDown = function(keyDown){ return currentKeyDown == keyDown }

	var KeyDown = function (e){
		currentKeyDown = e.code;
	}
	document.addEventListener("keydown",KeyDown);

	// тест свайпов
	// {
		var initialPoint;
		var finalPoint;
		document.addEventListener('touchstart', function(event) {
		//event.preventDefault(); // Выключение стандартного поведения браузера
		event.stopPropagation();
		initialPoint=event.changedTouches[0]; // запоминание начальной точки свайпа
		}, false);

		document.addEventListener('touchend', function(event) {
		//event.preventDefault(); // Выключение стандартного поведения браузера
		event.stopPropagation();
		finalPoint=event.changedTouches[0]; // запоминание конечной точки свайпа
		var xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
		var yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
		if (xAbs > 20 || yAbs > 20) {
			if (xAbs > yAbs) {
				if (finalPoint.pageX < initialPoint.pageX){
					//СВАЙП ВЛЕВО 
					currentKeyDown = "ArrowLeft";
				}
				else {
					//СВАЙП ВПРАВО
					currentKeyDown = "ArrowRight";
				}
			}
			else {
				if (finalPoint.pageY < initialPoint.pageY){
					//СВАЙП ВВЕРХ
					currentKeyDown = "Space";

				}
				else{
					//СВАЙП ВНИЗ
				}
			}
		}

		}, false);
	//}


	// "двигатель" игры. Постоянно запускает функцию oneLoopGame. Взято из инета и немного изменено
	// {
		var __renderer = (function() { // нужно изучить что это-------------------------------------------------
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame  ||
			window.mozRequestAnimationFrame		||
			window.oRequestAnimationFrame		||
			window.msRequestAnimationFrame		||
			function (callback){
				setTimeout(callback,1000/60);
			};
		})();

		var startGame = function() {
			gameLoop();
			Restart();
		}

		var gameLoop = function() {
			oneLoopGame();
			__renderer(gameLoop);
		}
	// }
	startGame();





}



game();







