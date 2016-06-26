/**
 * Created by john.sjostrom on 2016-06-26.
 */
Wheel.Reel = function(game){
    this.game = game;

    game.signals.loadAssets.add(this.loadAssets, this);
    game.signals.initAnimation.add(this.initAnimation, this);
    game.signals.startSpin.add(this.startSpin, this);
    game.signals.stopSpin.add(this.stopSpin, this);
    game.signals.reelsStopped.add(this.reelsStopped, this);
};

Wheel.Reel.prototype = {
    loadAssets : function(){
        var me = this,
            symbols = [
                "sym1",
                "sym2",
                "sym3",
                "sym4",
                "sym5",
                "sym6"
            ];

        symbols.forEach(function(symbol){
            me.game.load.image(symbol, "assets/images/symbols/" + symbol + ".png");
            me.game.load.image(symbol + "_blur", "assets/images/symbols/" + symbol + "_blur.png");
        });

        me.game.load.image("reel", "assets/images/reels/reelBackground.png");
    },

    initAnimation : function(){
        var layer = Wheel.Utils.getLayer("reel"),
            reelBackground = new Phaser.Sprite(this.game, 0, 0, "reel", 0),
            cfg = {
                reels : [
                    {r : 437.5, n : 16},
                    {r : 612.5, n : 22},
                    {r : 787.5, n : 30},
                    {r : 962.5, n : 38},
                    {r : 1137.5, n : 46}
                ],
                spinTimes : {
                    minimumSpinTime : 1000,
                    startDelay : [0, 100, 200, 300, 400],
                    stopDelay : [1000, 1300, 1550, 1750, 1900],
                    speed : [0.27, 0.24, 0.21, 0.18, 0.15],
                    startBounce : 10,
                    endBounce : 10
                }
            };

        layer.y = 720/2;
        reelBackground.anchor = new Phaser.Point(0.5, 0.5);
        layer.add( reelBackground );

        this.cfg = cfg;
        this.reels = this.createReels(layer, cfg);
        this.layer = layer;
    },

    createReels : function(layer, cfg){
        var me = this,
            reels = [];

        cfg.reels.forEach(function(reel, i){
            var group = new Phaser.Group(me.game, layer);

            group.spinSpeed = me.cfg.spinTimes.speed[i];

            for ( i = -1; ++i < reel.n; ){
                var symbol = "sym" + (Math.floor(Math.random() * 6) + 1),
                    angle = ((360/reel.n) * i) * (Math.PI/180),
                    x = reel.r * Math.cos(angle),
                    y = reel.r * Math.sin(angle),
                    sprite = new Phaser.Sprite(me.game, x, y, symbol, 0),
                    blur = new Phaser.Sprite(me.game, x, y, symbol + "_blur", 0);

                sprite.anchor = new Phaser.Point(0.5, 0.5);
                sprite.rotation = angle;
                blur.anchor = new Phaser.Point(0.5, 0.5);
                blur.rotation = angle;
                blur.visible = false;
                group.addMultiple([sprite, blur]);
            }

            reels.push(group);
        });

        return reels;
    },

    startSpin : function(){
        var me = this,
            spinTimes = me.cfg.spinTimes,
            minimumSpinTime = spinTimes.minimumSpinTime,
            speed, upDownDuration, upAngle, from, to, tween, delay, up;

        me.reels.forEach(function(reel, i){
            speed = spinTimes.speed[i];
            upDownDuration = spinTimes.startBounce / speed * 1.75;
            delay = spinTimes.startDelay[i];
            from = reel.angle;
            upAngle = from - spinTimes.startBounce;
            to = from + minimumSpinTime * speed;

            up = me.game.add.tween(reel).to({angle : upAngle}, upDownDuration, Phaser.Easing.Quadratic.Out, true, delay);
            tween = me.game.add.tween(reel).to({angle : to}, minimumSpinTime, Phaser.Easing.Quadratic.In);
            tween.onComplete.addOnce(me.idleSpin, reel);

            up.chain(tween);
        });

        game.add.tween(me.layer.scale).to( {x : 0.3, y : 0.3}, 500, Phaser.Easing.Back.InOut, true, 700 + upDownDuration);
        game.add.tween(me.layer).to( {x : 640}, 500, Phaser.Easing.Back.InOut, true, 700 + upDownDuration);
    },

    idleSpin : function(reel){

        reel.update = function(){
            reel.angle += reel.spinSpeed * this.game.time.elapsed; // to get angle for this frame
        };

        reel.children.forEach(function(sym){
            sym.visible = !sym.visible;
        });

        this.game.signals.reelAtIdleSpeed.dispatch();
    },

    stopSpin : function(){
        var me = this,
            tween;

        this.reels.forEach(function(reel, i){
            var duration = me.cfg.spinTimes.stopDelay[i],
                to = me.getStopAngle(reel, i, duration);

            reel.update = function(){};
            tween = me.game.add.tween(reel).to({angle : to}, duration, Phaser.Easing.Linear.None, true);
            tween.onComplete.addOnce(me.reelStopped.bind(me), reel);
            me.game.signals.reelStopping.dispatch(reel);
        });
    },

    getStopAngle : function(reel, i, duration) {
        var me = this,
            from = reel.angle,
            speed = me.cfg.spinTimes.speed[i],
            desiredAngle = speed * duration,
            desiredStopAngle = desiredAngle + from,
            anglePerSymbol = 360 / me.cfg.reels[i].n,
            nSymbols = Math.ceil(desiredStopAngle / anglePerSymbol);

        return nSymbols * anglePerSymbol;
    },

    reelStopped : function(reel){
        var me = this,
            offset = me.cfg.spinTimes.endBounce,
            duration = offset / reel.spinSpeed * 2,
            durationLast = duration * 0.33,
            start = reel.angle,
            turnOne = reel.angle + offset,
            turnTwo = reel.angle - offset * 0.33;

        var bounceOne = this.game.add.tween(reel).to({angle : turnOne}, duration, Phaser.Easing.Quadratic.Out, true),
            bounceTwo = this.game.add.tween(reel).to({angle : turnTwo}, duration, Phaser.Easing.Quadratic.InOut),
            bounceThree = this.game.add.tween(reel).to({angle : start}, durationLast, Phaser.Easing.Quadratic.In);

        bounceOne.chain(bounceTwo);
        bounceTwo.chain(bounceThree);

        reel.children.forEach(function(sym){
            sym.visible = !sym.visible;
        });

        this.game.signals.reelStopped.dispatch(reel);
    },

    reelsStopped : function(){
        game.add.tween(this.layer.scale).to( {x : 1, y : 1}, 500, Phaser.Easing.Back.InOut, true, 400);
        game.add.tween(this.layer).to( {x : 0}, 500, Phaser.Easing.Back.InOut, true, 400);
    }
};