/**
 * Created by john.sjostrom on 2016-06-26.
 */
(function () {
    Wheel.Utils = {
        createLayers : function(game, world){
            var layers = [
                "background",
                "reel",
                "ui"
            ];

            layers.forEach(function(layer){
                var group = new Phaser.Group(game, world);
                group.id = layer;
            });

            this.world = world;
        },

        getLayer : function(name){
            var layers = this.world.children,
                length = layers.length,
                i;

            for ( i = -1; ++i < length; ){
                if ( layers[i].id === name ){
                    return layers[i];
                }
            }

            console.warn("Could not find the layer (" + name + ") you where looking for");
        }
    }
}());