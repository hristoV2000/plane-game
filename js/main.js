//Variables
let app;

let player;
let score;
let scoreTimer;
let scoreLabel;
let enemyFly;
let enemyGroundArr = [];
let enemyGroundTimer = 50;
let bulletArr = [];
let highScore;

//bg variables
let bgBack;
let bgX = 0;
let bgSpeed = 1;

//function ground enemies 
function spawnGroundEnemy() {
    let enemyGround = new PIXI.Sprite.from("images/gun.png");
    enemyGround.anchor.set(0.5);
    enemyGround.x = 1100;
    enemyGround.y = 370;
    app.stage.addChild(enemyGround);
    enemyGroundArr.push(enemyGround);
}

//function bullets
function spawnBullet() {
    let randomNum = Math.floor(Math.random() * 3);
    if (enemyGroundArr[randomNum] != undefined) {
        let bullet = new PIXI.Sprite.from("images/bullet.png");
        bullet.anchor.set(0.5);
        bullet.x = enemyGroundArr[randomNum].x;
        bullet.y = 370;
        app.stage.addChild(bullet);
        bulletArr.push(bullet);
    }
}

//Controlls
let keys = new Map();
keys.set('87', false); //w
keys.set('83', false); //s
keys.set('65', false); //a
keys.set('68', false); //d

//Main Function
window.onload = function () {
    app = new PIXI.Application(
        {
            width: 1100,
            height: 400,
        }
    );
    //Registered Score
    if (localStorage.getItem('HighScore') == "undefined") {
        localStorage.setItem('HighScore', '0');
    }
    highScore = localStorage.getItem('HighScore');

    //Beginning screen score
    score = 0;
    scoreTimer = 150;
    scoreLabel = new PIXI.Text('Score: ' + score, { fontFamily: 'Lucida Console', fontSize: 24, fill: 0xF5F5F5, align: 'center' });
    scoreLabel.x = 0;
    scoreLabel.y = 0;
    scoreLabel.depth = 1100;
    document.body.appendChild(app.view);

    //Creating player
    player = new PIXI.Sprite.from("images/player.png");
    player.anchor.set(0.5);
    player.x = 30;
    player.y = app.view.height / 2;

    //Controls
    app.stage.interactive = true;
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    function keyDown(e) {
        keys.set(JSON.stringify(e.keyCode), true);
    }
    function keyUp(e) {
        keys.set(JSON.stringify(e.keyCode), false);
    }

    //Creating flying enemy
    let flyingEnemyTimer = 500;
    enemyFly = new PIXI.Sprite.from('images/rocket.png');
    enemyFly.anchor.set(0.5);

    //Background
    app.loader.baseUrl = "images";
    app.loader
        .add("bgBack", "2.jpg")
    app.loader.onComplete.add(initLevel);
    app.loader.load();

    //initializing the BG
    function initLevel() {
        bgBack = createBg(app.loader.resources["bgBack"].texture);
        app.ticker.add(gameLoop);
    }

    //creating the BG
    function createBg(texture) {
        let tiling = new PIXI.TilingSprite(texture, 1100, 400);
        tiling.position.set(0, 0);
        app.stage.addChild(tiling);
        return tiling;
    }
    //moving the BG
    function updateBg() {
        bgX = (bgX + bgSpeed);
        bgBack.tilePosition.x = bgX / 4;
    }

    //Main Function
    function gameLoop() {
        //adding score
        app.stage.addChild(scoreLabel);
        //adding player
        app.stage.addChild(player);
        updateBg();

        //Controlling the player
        if (keys.get('87') == true && player.y > 20) {
            player.y -= 4;
        }
        if (keys.get('83') == true && player.y < 380) {
            player.y += 4;
        }
        if (keys.get('65') == true && player.x > 20) {
            player.x -= 4;
        }
        if (keys.get('68') == true && player.x < 980) {
            player.x += 4;
        }

        //Collisions
        if (Math.abs(player.x - enemyFly.x) < 45 && Math.abs(player.y - enemyFly.y) < 55) {
            if (Number(highScore) < score) {
                localStorage.setItem('HighScore', JSON.stringify(score));
            }
            window.location.href = "start.html";
        }
        enemyGroundArr.forEach((item) => {
            if (Math.abs(player.x - item.x) < 45 && Math.abs(player.y - item.y) < 55) {
                if (Number(highScore) < score) {
                    localStorage.setItem('HighScore', JSON.stringify(score));
                }
                window.location.href = "start.html";
            }
        });

        bulletArr.forEach((item) => {
            if (Math.abs(player.x - item.x) < 45 && Math.abs(player.y - item.y) < 45) {
                if (Number(highScore) < score) {
                    localStorage.setItem('HighScore', JSON.stringify(score));
                }
                window.location.href = "start.html";
            }
        });

        //Moving Flying Enemies
        if (enemyFly != null) {
            enemyFly.x -= 7;
        }

        //Spawning Flying Enemies
        flyingEnemyTimer--;
        if (flyingEnemyTimer <= 0) {
            flyingEnemyTimer = 250;
            enemyFly.x = 1100;
            enemyFly.y = Math.floor(Math.random() * 370);
            app.stage.addChild(enemyFly);
        }

        //Spawning Ground Enemies and Bullets
        enemyGroundTimer--;
        if (enemyGroundTimer <= 0) {
            spawnGroundEnemy();
            spawnBullet();
            enemyGroundTimer = Math.floor(Math.random() * (400 - 150) + 150);

        }
        else if (enemyGroundTimer == 100) {
            spawnBullet();
        }

        //Adding Score
        scoreTimer--;
        if (scoreTimer <= 0) {
            scoreTimer = 150;
            score++;
            scoreLabel.text = "Score: " + score;
        }

        //Moving Ground Enemies
        enemyGroundArr.forEach((item) => {
            item.x -= 2;
            //Destroying the element after it has left the visible area
            if (item.x < -30) {
                app.stage.removeChild(item);
                let newGroundArr = new Array();
                for (let i = 0; i < enemyGroundArr.length; i++) {
                    if (enemyGroundArr[i] != item) {
                        newGroundArr.push(enemyGroundArr[i]);
                    }
                }
                enemyGroundArr = newGroundArr;
            }
        });

        //Bullet moves
        bulletArr.forEach((item) => {
            item.x -= 4;
            item.y -= 2;
            if (item.x < -50) {
                app.stage.removeChild(item);
                let newBulletArr = new Array();
                for (let i = 0; i < bulletArr.length; i++) {
                    if (enemyGroundArr[i] != item) {
                        newBulletArr.push(bulletArr[i]);
                    }
                }
                bulletArr = newBulletArr;
            }
        });
    }
}