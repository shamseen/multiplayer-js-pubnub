console.log("JS linked!");

/* ---- Setup ---- */
const config = {
    /* what it will use to render
       if WebGL fails, uses Canvas */
    type: Phaser.AUTO,

    // size of canvas element
    width: 800,
    height: 600,

    // game physics
    // Object factory: this.physics.add(foo)
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },

    // game is a sequence of scenes
    // instances need crud functionality for render
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
var score = 0;
var scoreText;
var platforms;
var asteroids;
var player;
var cursor;
var gameOver;


// need to preload assets first
function preload() {
    // assets are sourced from their site
    this.load.setBaseURL('https://labs.phaser.io/assets');

    // first param is just setting a var name
    // second finishes the url reference
    this.load.image('sky', '/skies/sky4.png');
    this.load.image('ground', '/sprites/platform.png');
    this.load.image('star', '/demoscene/star.png');
    this.load.image('asteroid', '/games/asteroids/asteroid2.png');
    this.load.spritesheet('dude',
        '/sprites/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

// adding assets to browser/canvas
function create() {
    // loaded in order of back to front
    this.add.image(400, 300, 'sky');

    // show player score (coordinates, default string, styling)
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // platforms are grouped objects; static
    platforms = this.physics.add.staticGroup();
    createPlatforms(platforms);

    /* ---- Falling star objects! ---- */
    // group is NOT static
    stars = this.physics.add.group({
        key: 'star', // texture key
        repeat: 11, // 12 stars total
        setXY: { x: 12, y: 0, stepX: 70 } // sibling spacing = 70px
    });

    // collide with platforms
    this.physics.add.collider(stars, platforms);

    // random bounce value
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });


    /* --- creating a player character! ---- */
    player = this.physics.add.sprite(100, 450, 'dude')

    // setting sprite object physics
    player.setCollideWorldBounds(true); // stays within canvas
    player.setBounce(0.2); // bounces when he hits the edge

    /* -- Falling Asteroids! Released when a star is collected -- */
    asteroids = this.physics.add.group();
    this.physics.add.collider(asteroids, platforms);
    this.physics.add.collider(player, asteroids, asteroidHit, null, this);

    // detect collision with platforms
    // so sprite doesn't fall thru to screen bottom
    this.physics.add.collider(player, platforms);

    // detect overlap with stars => collect
    this.physics.add.collider(stars, platforms); // allow for collision
    this.physics.add.overlap(player, stars, collectStar, null, this);
    // upon overlap, call collectStar();

    /* ---- animations ---- */
    this.anims.create({
        // keyboard trigger
        key: 'left',

        // which frames in spritesheet to use
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1 // loops thru set frames
    });

    // player facing forward
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // keyboard functionality
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {

    // game over logic
    if (gameOver) {
        return;
    }

    // defining what happens w/ each keyboard trigger
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // left = negative x axis
        player.anims.play('left', true); // calling 'left' anim from before
    }

    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }

    // if neither left/right, then stop moving, faces you
    // stop/start style of movement
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    // jumping: check if on the floor so no double jumps
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-300); // height of jump
    }
}

function asteroidHit(player, ast) {

    // if hit, stop everything
    this.physics.pause();

    // fade player, reset sprite
    player.setTint(0xff0000);
    player.anims.play('turn');

    // end game
    gameOver = true;
}
function collectStar(player, star) {
    // test
    console.log('collected star');

    // make star invisible
    star.disableBody(true, true);

    // add to player score
    score += 10;
    scoreText.setText('Score: ' + score);

    /* -- Drop asteroid -- */
    // if last star, reset all stars to active
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }

    // randomly generate x coordinate to drop from
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    dropAsteroid(x)
}

function createPlatforms(platforms) {
    // setting the ground using a platform (scaling up to fill scene
    // ALWAYS use refreshBody() when rescaling a static obj
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // adding floating platforms
    // no rescale so no refresh()
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
}

function dropAsteroid(x) {

    // Group.create() returns instance of new object
    var ast = asteroids.create(x, 16, 'asteroid').setScale(0.5);
    ast.setBounce(1);
    ast.setCollideWorldBounds(true);
    ast.setVelocity(Phaser.Math.Between(-200, 200), 20); // variable velocity

}
/* WEBSITE TUTORIAL IS OUT OF DATE. FOLLOWING preload() DOES NOT WORK BC FILESTRUCTURE DOESN'T EXIST
http://phaser.io/tutorials/making-your-first-phaser-3-game/part2 */

// function preload() {
//     this.load.image('sky', 'assets/sky.png');
//     this.load.image('ground', 'assets/platform.png');
//     this.load.image('star', 'assets/star.png');
//     this.load.image('bomb', 'assets/bomb.png');
//     this.load.spritesheet('dude',
//         'assets/dude.png',
//         { frameWidth: 32, frameHeight: 48 }
//     );
// }