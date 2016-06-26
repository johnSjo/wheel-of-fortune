/**
 * Created by john.sjostrom on 2016-06-26.
 */
var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });

window.Wheel = {};

function preload() {
    var me = this;

    // set up some game events
    game.signals = {
        loadAssets : new Phaser.Signal(),
        initAnimation : new Phaser.Signal(),
        spinButtonClick : new Phaser.Signal(),
        reelAtIdleSpeed : new Phaser.Signal(),
        startSpin : new Phaser.Signal(),
        stopSpin : new Phaser.Signal(),
        reelsSpinning : new Phaser.Signal(),
        reelStopping : new Phaser.Signal(),
        reelStopped : new Phaser.Signal(),
        reelsStopped : new Phaser.Signal()
    };

    game.signals.spinButtonClick.add(spinButtonClick, me);
    game.signals.reelAtIdleSpeed.add(reelAtIdleSpeed, me);
    game.signals.reelStopping.add(reelStopping, me);
    game.signals.reelStopped.add(reelStopped, me);

    // create game objects
    me.Wheel = {};
    me.Wheel.background = new Wheel.Background(game);
    me.Wheel.reel = new Wheel.Reel(game);
    me.Wheel.spinButton = new Wheel.SpinButton(game);

    me.gameState = "idle";
    me.reelsState = {
        idle : 5,
        spinning : 0
    };

    // tell all the game objects to load their assets
    game.signals.loadAssets.dispatch(game);

    // make sure the game area scales with the window
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
}

function create() {
    // create the world group to put everything in
    var world = new Phaser.Group(game);

    // and the layers so we can put things in the order we want
    Wheel.Utils.createLayers(game, world);

    // tell all the game objects to create and add their items to the world
    game.signals.initAnimation.dispatch(world);

}

function update() {
}

function spinButtonClick(){
    switch( this.gameState ){
        case "idle":
            this.gameState = "spinStarting";
            game.signals.startSpin.dispatch();
            break;
        case "spinning":
            this.gameState = "spinStopping";
            game.signals.stopSpin.dispatch();
            break;
        default:
            console.log("can't start or stop at the moment");
    }
}

function reelAtIdleSpeed(){
    this.reelsState.idle--;
    this.reelsState.spinning++;

    if ( this.reelsState.spinning === 5 ){
        this.gameState = "spinning";
        game.signals.reelsSpinning.dispatch();
    }
}

function reelStopping(reel){}

function reelStopped(){
    this.reelsState.idle++;
    this.reelsState.spinning--;

    if ( this.reelsState.idle === 5 ){
        this.gameState = "idle";
        game.signals.reelsStopped.dispatch();
    }
}