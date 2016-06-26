/**
 * Created by john.sjostrom on 2016-06-26.
 */
Wheel.Background = function(game, config){
    this.game = game;

    game.signals.loadAssets.add(this.loadAssets, this);
    game.signals.initAnimation.add(this.initAnimation, this);
};

Wheel.Background.prototype = {
    loadAssets : function(){
        this.game.load.image("sky", "assets/images/background.png");
    },

    initAnimation : function(){
        var layer = Wheel.Utils.getLayer("background");

        layer.add( new Phaser.Sprite(this.game, 0, 0, "sky", 0) );
    }
};