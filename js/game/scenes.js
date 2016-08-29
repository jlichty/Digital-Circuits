export default (function(engineInstancePromise, Scene, UI, Lab) {
    
    var $ = {}, canvas, tools;

    engineInstancePromise.then(function(engine) {
        canvas = engine.canvas;
        tools = engine.tools;
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
        designArea.create();
        
        var andGateButton = new Lab.SpawnerButton(50, 40, Lab.AndGate);
        andGateButton.create();

        var nandGateButton = new Lab.SpawnerButton(100, 40, Lab.NandGate);
        nandGateButton.create();

        var orGateButton = new Lab.SpawnerButton(150, 40, Lab.OrGate);
        orGateButton.create();

        var xorGateButton = new Lab.SpawnerButton(200, 40, Lab.XorGate);
        xorGateButton.create();

        var cutterButton = new Lab.ToolButton(700, 40, tools.cutterTool, Lab.CutterIcon);
        cutterButton.create();

        var trashcanButton = new Lab.ToolButton(750, 40, tools.trashTool, Lab.TrashcanIcon);
        trashcanButton.create();
    });

    return $;

});