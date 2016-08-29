export default (function(engineInstancePromise, Entity, Components, Geometry, Graphics, Physics, UI) {

    var $ = {}, toolController, tools, DISPLAYLAYERS;

    engineInstancePromise.then(function(engine) {
        tools = engine.tools;
        toolController = engine.toolController;
        DISPLAYLAYERS = engine.drawSystem.DISPLAYLAYERS;
    });

    // tool Icons

    // CLASS ToolIcon
    ToolIcon.prototype = Object.create(Entity.prototype);
    ToolIcon.prototype.constructor = ToolIcon;
    function ToolIcon(x, y) {
        Entity.call(this);

         // pose
        var position = new Geometry.Position(x, y);
        var poseComponent = new Components.PoseComponent(position, 0);

        // sprite
        var spriteComponent = new Components.SpriteComponent(this.sprite);

        // drawable on tool icon layer
        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.TOOLICON);

        // compose entity
        this.addComponent(poseComponent);
        this.addComponent(spriteComponent);
        this.addComponent(drawableComponent);
    };
    $.ToolIcon = ToolIcon;

    CutterIcon.prototype = Object.create(ToolIcon.prototype);
    CutterIcon.prototype.constructor = CutterIcon;
    function CutterIcon(x, y) {
        
        ToolIcon.call(this, x, y);

    };
    $.CutterIcon = CutterIcon;

    TrashcanIcon.prototype = Object.create(ToolIcon.prototype);
    TrashcanIcon.prototype.constructor = TrashcanIcon;
    function TrashcanIcon(x, y) {
        
        ToolIcon.call(this, x, y);

    };
    $.TrashcanIcon = TrashcanIcon;

    // lab circuit design elements

    // CLASS LabElement
    LabElement.prototype = Object.create(Entity.prototype);
    LabElement.prototype.constructor = LabElement;
    function LabElement() {
        Entity.call(this);
    };
    $.LabElement = LabElement;

    // CLASS Wire
    Wire.prototype = Object.create(LabElement.prototype);
    Wire.prototype.constructor = Wire;
    function Wire(tailObject, headObject) {
        
        LabElement.call(this);

        var lineComponent = new Components.LineComponent(
            tailObject.getComponent(Components.PoseComponent),
            headObject.getComponent(Components.PoseComponent),
            new Graphics.LineStyleTemplate('#FFFFFF', 2),
            new Physics.LineCollisionParameters(40, 0.9)
        );

        var poseComponent = new Components.PoseComponent(lineComponent.position, lineComponent.orientation);
        lineComponent.addEventListener('onpositionchange', this, this.__updatePickableMesh);
        lineComponent.addEventListener('onorientationchange', this, this.__updatePickableMesh);

        var meshComponent = new Components.MeshComponent(
            lineComponent.mesh,
            new Graphics.MeshStyleTemplate('#FFFFFF', null, 2)
        );

        var pickableComponent = new Components.PickableComponent();
        pickableComponent.addEventListener('onmouseenter', this, this.__onmouseenter);
        pickableComponent.addEventListener('onmouseleave', this, this.__onmouseleave);

        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEENTITIES);

        this.addComponent(lineComponent);
        this.addComponent(poseComponent);
        this.addComponent(meshComponent);
        this.addComponent(pickableComponent);
        this.addComponent(drawableComponent);

    };
    Wire.prototype.__updatePickableMesh = function() {
        // update poseComponent relative to lineComponent
        var lineComponent = this.getComponent(Components.LineComponent);
        var poseComponent = this.getComponent(Components.PoseComponent);
        poseComponent.position = lineComponent.position;
        poseComponent.orientation = lineComponent.orientation;
        // update mesh
        var meshComponent = this.getComponent(Components.MeshComponent);
        meshComponent.mesh = lineComponent.mesh;
    };
    Wire.prototype.__onmouseenter = function() {
        var meshComponent = this.getComponent(Components.MeshComponent);
        meshComponent.style = new Graphics.MeshStyleTemplate('#FF5AC8', null, 2);
    };
    Wire.prototype.__onmouseleave = function() {
        var meshComponent = this.getComponent(Components.MeshComponent);
        meshComponent.style = new Graphics.MeshStyleTemplate('#FFFFFF', null, 2);
    };
    $.Wire = Wire;

    // CLASS ToolHandle
    ToolHandle.prototype = Object.create(LabElement.prototype);
    ToolHandle.prototype.constructor = ToolHandle;
    function ToolHandle(x, y) {

        LabElement.call(this);

        var poseComponent = new Components.PoseComponent(new Geometry.Position(x, y), 0);

        this.addComponent(poseComponent);

    };
    $.ToolHandle = ToolHandle;

    // CLASS TerminalWire
    // forms the inner wire between a circuit element and one of its terminals
    TerminalWire.prototype = Object.create(LabElement.prototype);
    TerminalWire.prototype.constructor = TerminalWire;
    function TerminalWire(terminalWireAnchor, terminal) {

        LabElement.call(this);

        var lineComponent = new Components.LineComponent(
            terminalWireAnchor.getComponent(Components.PoseComponent),
            terminal.getComponent(Components.PoseComponent),
            new Graphics.LineStyleTemplate('#FFFFFF', 2)
        );

        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEENTITIES);

        this.addComponent(lineComponent);
        this.addComponent(drawableComponent);
    };
    $.TerminalWire = TerminalWire;

    // CLASS CircuitElementFeature
    CircuitElementFeature.prototype = Object.create(LabElement.prototype);
    CircuitElementFeature.prototype.constructor = CircuitElementFeature;
    function CircuitElementFeature(relativeOffsetPosition, circuitElement) {
        LabElement.call(this);

        this.offset = relativeOffsetPosition;
        this.circuitElement = circuitElement;

        // pose
        var circuitElementPose = this.circuitElement.getComponent(Components.PoseComponent);
        var poseComponent = new Components.PoseComponent(new Geometry.Position(0, 0), 0);

        // configure circuitElement position following
        circuitElementPose.addEventListener('onpositionchange', this, this.__setPoseRelativeToCircuitElement);
        circuitElementPose.addEventListener('onorientationchange', this, this.__setPoseRelativeToCircuitElement);

        // compose entity
        this.addComponent(poseComponent);

        // initialize location
        this.addEventListener('oninit', this, this.__setPoseRelativeToCircuitElement);
    };
    CircuitElementFeature.prototype.__setPoseRelativeToCircuitElement = function() {
        var circuitElementPose = this.circuitElement.getComponent(Components.PoseComponent)
        var position = circuitElementPose.position;
        var orientation = circuitElementPose.orientation;
        var templateX = this.offset.x;
        var templateY = this.offset.y;
        var x = templateX*Math.cos(orientation) - templateY*Math.sin(orientation) + position.x;
        var y = templateX*Math.sin(orientation) + templateY*Math.cos(orientation) + position.y;
        var poseComponent = this.getComponent(Components.PoseComponent);
        poseComponent.position = new Geometry.Position(x, y);
        poseComponent.orientation = orientation;
    };
    $.CircuitElementFeature = CircuitElementFeature;

    // CLASS TerminalWireAnchor
    TerminalWireAnchor.prototype = Object.create(CircuitElementFeature.prototype);
    TerminalWireAnchor.prototype.constructor = TerminalWireAnchor;
    function TerminalWireAnchor(relativeOffsetPosition, circuitElement) {

        CircuitElementFeature.call(this, relativeOffsetPosition, circuitElement);

    };
    $.TerminalWireAnchor = TerminalWireAnchor;

    // CLASS Terminal
    Terminal.prototype = Object.create(CircuitElementFeature.prototype);
    Terminal.prototype.constructor = Terminal;
    function Terminal(relativeOffsetPosition, circuitElement) {
        
        CircuitElementFeature.call(this, relativeOffsetPosition, circuitElement);

        // entity is pickable
        var collisionBounds = new Geometry.Rectangle(20, 20);
        var mesh = new Geometry.Mesh(collisionBounds);
        var meshComponent = new Components.MeshComponent(mesh);
        var pickableComponent = new Components.PickableComponent();

        // configure pick action
        pickableComponent.addEventListener('onpick', this, this.__onpick);

        // configure hover actions
        pickableComponent.addEventListener('onselect', this, this.__onselect);
        pickableComponent.addEventListener('ondeselect', this, this.__ondeselect);
        pickableComponent.addEventListener('onmouseenter', this, this.__onmouseenter);
        pickableComponent.addEventListener('onmouseleave', this, this.__onmouseleave);

        // compose entity
        this.addComponent(meshComponent);
        this.addComponent(pickableComponent);
    };
    Terminal.prototype.__onselect = function() {
        var spriteComponent = this.getComponent(Components.SpriteComponent);
        spriteComponent.setFrame(2);
    };
    Terminal.prototype.__ondeselect = function() {
        var spriteComponent = this.getComponent(Components.SpriteComponent);
        if (this instanceof OutputTerminal) {
            spriteComponent.setFrame(0);
        } else if (this instanceof InputTerminal) {
            spriteComponent.setFrame(1);
        }
    };
    Terminal.prototype.__onmouseenter = function() {
        var spriteComponent = this.getComponent(Components.SpriteComponent);
        spriteComponent.setFrame(2);
    };
    Terminal.prototype.__onmouseleave = function() {
        var spriteComponent = this.getComponent(Components.SpriteComponent);
        if (this instanceof OutputTerminal) {
            spriteComponent.setFrame(0);
        } else if (this instanceof InputTerminal) {
            spriteComponent.setFrame(1);
        }
    };
    Terminal.prototype.__onpick = function() {
        toolController.equip(tools.wireTool, this);
    };
    $.Terminal = Terminal;

    // CLASS OutputTerminal
    OutputTerminal.prototype = Object.create(Terminal.prototype);
    OutputTerminal.prototype.constructor = OutputTerminal;
    function OutputTerminal(relativeOffsetPosition, circuitElement) {

        // inherits from
        Terminal.call(this, relativeOffsetPosition, circuitElement);

        // modify parent to include OutputTerminal container
        if (!this.circuitElement.outputTerminals) {
            this.circuitElement.outputTerminals = [];
        }

        this.circuitElement.outputTerminals.push(this);

        // sprite
        var spriteComponent = new Components.SpriteComponent(this.sprite);
        spriteComponent.setFrame(0);

        // drawable on game entity layer
        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEENTITIES);

        // compose entity
        this.addComponent(spriteComponent);
        this.addComponent(drawableComponent);
    };
    $.OutputTerminal = OutputTerminal;

    // CLASS InputTerminal
    InputTerminal.prototype = Object.create(Terminal.prototype);
    InputTerminal.prototype.constructor = InputTerminal;
    function InputTerminal(relativeOffsetPosition, circuitElement) {

        // inherits from
        Terminal.call(this, relativeOffsetPosition, circuitElement);

        // modify parent to include OutputTerminal container
        if (!this.circuitElement.inputTerminals) {
            this.circuitElement.inputTerminals = [];
        }

        this.circuitElement.inputTerminals.push(this);

        // sprite
        var spriteComponent = new Components.SpriteComponent(this.sprite);
        spriteComponent.setFrame(1);

        // drawable on game entity layer
        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEENTITIES);

        // compose entity
        this.addComponent(spriteComponent);
        this.addComponent(drawableComponent);
    };
    $.InputTerminal = InputTerminal;

    // CLASS CircuitElement
    CircuitElement.prototype = Object.create(LabElement.prototype);
    CircuitElement.prototype.constructor = CircuitElement;
    function CircuitElement(x, y) {
        
        LabElement.call(this);
        
        // pose
        var position = new Geometry.Position(x, y);
        var poseComponent = new Components.PoseComponent(position, 0);

        // sprite
        var spriteComponent = new Components.SpriteComponent(this.sprite);

        // drawable on game entity layer
        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEENTITIES);

        // configure sprite as collision mesh
        var meshComponent = new Components.MeshComponent(spriteComponent.mesh);
        
        // entity is pickable
        var pickableComponent = new Components.PickableComponent();

        // configure pick action
        pickableComponent.addEventListener('onpick', this, this.__onpick);

        // compose entity
        this.addComponent(poseComponent);
        this.addComponent(spriteComponent);
        this.addComponent(drawableComponent);
        this.addComponent(meshComponent);
        this.addComponent(pickableComponent);
    };
    CircuitElement.prototype.__onpick = function() {
        toolController.equip(tools.placingTool, this);
    };
    $.CircuitElement = CircuitElement;

    // CLASS Gate
    Gate.prototype = Object.create(CircuitElement.prototype);
    Gate.prototype.constructor = Gate;
    function Gate(x, y) {

        CircuitElement.call(this, x, y);

        // terminals
        var terminalOffsetMargin = 35;
        
        var spriteComponent = this.getComponent(Components.SpriteComponent);

        // output terminal
        var outputTerminal = new OutputTerminal(new Geometry.Position(0, -terminalOffsetMargin), this);
        var outputTerminalAnchor = new TerminalWireAnchor(new Geometry.Position(0, -spriteComponent.height/2), this);
        var outputTerminalWire = new TerminalWire(outputTerminal, outputTerminalAnchor);
        // configure dependencies
        this.addChild(outputTerminal);
        this.addChild(outputTerminalAnchor);
        this.addChild(outputTerminalWire);
        
        // input terminal
        var inputTerminal = new InputTerminal(new Geometry.Position(0, terminalOffsetMargin), this);
        var inputTerminalAnchor = new TerminalWireAnchor(new Geometry.Position(0, spriteComponent.height/2), this);
        var inputTerminalWire = new TerminalWire(inputTerminal, inputTerminalAnchor);
        // configure dependencies
        this.addChild(inputTerminal);
        this.addChild(inputTerminalAnchor);
        this.addChild(inputTerminalWire);
    };
    $.Gate = Gate;

    // CLASS AndGate
    AndGate.prototype = Object.create(Gate.prototype);
    AndGate.prototype.constructor = AndGate;
    function AndGate(x, y) {

        Gate.call(this, x, y);
    };
    $.AndGate = AndGate;

    // CLASS NandGate
    NandGate.prototype = Object.create(Gate.prototype);
    NandGate.prototype.constructor = NandGate;
    function NandGate(x, y) {

        Gate.call(this, x, y);

    };
    $.NandGate = NandGate;

    // CLASS OrGate
    OrGate.prototype = Object.create(Gate.prototype);
    OrGate.prototype.constructor = OrGate;
    function OrGate(x, y) {

        Gate.call(this, x, y);

    };
    $.OrGate = OrGate;

    // CLASS XorGate
    XorGate.prototype = Object.create(Gate.prototype);
    XorGate.prototype.constructor = XorGate;
    function XorGate(x, y) {

        Gate.call(this, x, y);

    };
    $.XorGate = XorGate;

    // CLASS PowerSource
    PowerSource.prototype = Object.create(CircuitElement.prototype);
    PowerSource.prototype.constructor = PowerSource;
    function PowerSource(x, y) {
        
        CircuitElement.call(this);

        // terminals
        var terminalOffsetMargin = 35;
        
        // output terminal
        var outputTerminal = new OutputTerminal(new Geometry.Position(0, -terminalOffsetMargin), this);
        var outputTerminalAnchor = new TerminalWireAnchor(new Geometry.Position(0, -spriteComponent.height/2), this);
        var outputTerminalWire = new TerminalWire(outputTerminal, outputTerminalAnchor);
        // configure dependencies
        this.addChild(outputTerminal);
        this.addChild(outputTerminalAnchor);
        this.addChild(outputTerminalWire);
        
        // input terminal
        var inputTerminal = new InputTerminal(new Geometry.Position(0, terminalOffsetMargin), this);
        var inputTerminalAnchor = new TerminalWireAnchor(new Geometry.Position(0, spriteComponent.height/2), this);
        var inputTerminalWire = new TerminalWire(inputTerminal, inputTerminalAnchor);
        // configure dependencies
        this.addChild(inputTerminal);
        this.addChild(inputTerminalAnchor);
        this.addChild(inputTerminalWire);
    };
    $.PowerSource = PowerSource;

    // design area

    // CLASS CircuitDesignArea
    CircuitDesignArea.prototype = Object.create(LabElement.prototype);
    CircuitDesignArea.prototype.constructor = CircuitDesignArea;
    function CircuitDesignArea(x, y, width, height) {
        
        LabElement.call(this);

        // pose
        var position = new Geometry.Position(x, y);
        var poseComponent = new Components.PoseComponent(position, 0);

        // image
        var imageStyleTemplate = new Graphics.ImageStyleTemplate(115, 63, width/2, height/2, width, height);
        var imageComponent = new Components.ImageComponent(this.image, imageStyleTemplate);

        // drawable on game background layer
        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.GAMEBACKGROUND);

        // configure image as collision mesh
        var meshComponent = new Components.MeshComponent(imageComponent.mesh);

        // design area is pickable
        var pickableComponent = new Components.PickableComponent();

        // compose entity
        this.addComponent(poseComponent);
        this.addComponent(imageComponent);
        this.addComponent(drawableComponent);
        this.addComponent(meshComponent);
        this.addComponent(pickableComponent);
    };
    $.CircuitDesignArea = CircuitDesignArea;

    // UI elements

    // CLASS Toolbar
    Toolbar.prototype = Object.create(UI.UIElement.prototype);
    Toolbar.prototype.constructor = Toolbar;
    function Toolbar() {
        UI.UIElement.call(this);
    };
    $.Toolbar = Toolbar;

    // CLASS ToolbarElement
    ToolbarElement.prototype = Object.create(UI.UIElement.prototype);
    ToolbarElement.prototype.constructor = ToolbarElement;
    function ToolbarElement() {
        UI.UIElement.call(this);
    };
    $.ToolbarElement = ToolbarElement;

    // CLASS button
    Button.prototype = Object.create(ToolbarElement.prototype);
    Button.prototype.constructor = Button;
    function Button(x, y, sprite) {
        
        ToolbarElement.call(this);

        var poseComponent = new Components.PoseComponent(new Geometry.Position(x, y), 0);

        var spriteComponent = new Components.SpriteComponent(sprite);

        var drawableComponent = new Components.DrawableComponent(DISPLAYLAYERS.UIENTITIES);

        var meshComponent = new Components.MeshComponent(spriteComponent.mesh);

        var pickableComponent = new Components.PickableComponent();

        // compose entity
        this.addComponent(poseComponent);
        this.addComponent(spriteComponent);
        this.addComponent(drawableComponent);
        this.addComponent(meshComponent);
        this.addComponent(pickableComponent);
    };
    $.Button = Button;

    // CLASS ToolButton
    ToolButton.prototype = Object.create(Button.prototype);
    ToolButton.prototype.constructor = ToolButton;
    function ToolButton(x, y, tool, ToolIconClass) {
        
        Button.call(this, x, y, ToolIconClass.prototype.sprite);

        this.__tool = tool;

        var pickableComponent = this.getComponent(Components.PickableComponent);
        pickableComponent.addEventListener('onpick', this, this.__onpick);
    };
    ToolButton.prototype.__onpick = function() {
        toolController.equip(this.__tool);
    };
    $.ToolButton = ToolButton;

    // CLASS SpawnerButton
    SpawnerButton.prototype = Object.create(Button.prototype);
    SpawnerButton.prototype.constructor = SpawnerButton;
    function SpawnerButton(x, y, circuitElementClass) {
        
        Button.call(this, x, y, circuitElementClass.prototype.sprite);

        this.__circuitElementClass = circuitElementClass;

        var pickableComponent = this.getComponent(Components.PickableComponent);
        pickableComponent.addEventListener('onpick', this, this.__onpick);
    };
    SpawnerButton.prototype.__onpick = function() {
        var position = (this.getComponent(Components.PoseComponent)).position;
        var element = new this.__circuitElementClass(position.x, position.y);
        // create entity (add to current scene)
        element.create();
        // place spawned element
        toolController.equip(tools.placingTool, element);
    };
    $.SpawnerButton = SpawnerButton;

    return $;

});