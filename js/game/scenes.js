export default (function(engineInstancePromise, Scene, UI, Lab) {
    
    var $ = {}, canvas;

    engineInstancePromise.then(function(engine) {
        canvas = engine.canvas;
    });

    $.noScene = new Scene();

    $.mainMenuScene = new Scene();

    $.labScene = new Scene();
    $.labScene.addEventListener('oninit', $.labScene, function() {
        
        var designArea = new Lab.CircuitDesignArea(
            canvas.clientWidth/2,
            canvas.clientHeight/2,
            canvas.clientWidth,
            canvas.clientHeight
        );
        
        var andGateButton = new Lab.SpawnerButton(50, 40, Lab.AndGate)
    
    });

    return $;

});