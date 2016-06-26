/**
 * Created by john.sjostrom on 2016-06-26.
 */
Wheel.SpinButton = function(game){
    this.game = game;

    game.signals.loadAssets.add(this.loadAssets, this);
    game.signals.initAnimation.add(this.initAnimation, this);
    game.signals.startSpin.add(this.startSpin, this);
    game.signals.reelsSpinning.add(this.reelsSpinning, this);
    game.signals.stopSpin.add(this.stopSpin, this);
    game.signals.reelsStopped.add(this.reelsStopped, this);
};

Wheel.SpinButton.prototype = {
    loadAssets : function(){
        this.game.load.spritesheet("spinButton", "assets/images/ui/spinButton.png", 200, 200);
    },

    initAnimation : function(){
        var me = this,
            layer = Wheel.Utils.getLayer("ui"),
            button = new Phaser.Button(me.game, 0, 0, "spinButton", me.actionOnClick, this, 1, 0, 2),
            style = { font: "55px Arial", fill: "#ffffff", align: "center"},
            buttonText = new Phaser.Text(me.game, 0, 0, "SPIN", style);

        layer.addMultiple([button, buttonText]);
        layer.x = 150;
        layer.y = 360;
        layer.scale = new Phaser.Point(1.2, 1.2);

        button.anchor = new Phaser.Point(0.5, 0.5);
        buttonText.anchor = new Phaser.Point(0.5, 0.5);

        me.button = button;
        me.buttonText = buttonText;
    },

    actionOnClick : function(){
        this.game.signals.spinButtonClick.dispatch();
    },

    startSpin : function(){
        this.buttonText.text = "STOP";
        this.buttonText.alpha = 0.2;
        this.button.alpha = 0.7;
        this.button.input.enabled = false;
    },

    reelsSpinning : function(){
        this.buttonText.alpha = 1;
        this.button.alpha = 1;
        this.button.input.enabled = true;
    },

    stopSpin : function(){
        this.buttonText.text = "SPIN";
        this.buttonText.alpha = 0.2;
        this.button.alpha = 0.7;
        this.button.input.enabled = false;
    },

    reelsStopped : function(){
        this.buttonText.alpha = 1;
        this.button.alpha = 1;
        this.button.input.enabled = true;
    }
};