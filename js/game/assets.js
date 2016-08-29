export default (function(Graphics, Lab) {

    var $ = {};

    $.imageMap = new Graphics.ImageMap(
        new Graphics.ImageSourcePair(Lab.CircuitDesignArea.prototype, 'img/Backgrounds/blueprint-paper.jpg')
    );

    $.spriteMap = new Graphics.SpriteMap(
        new Graphics.SpriteSourcePair(Lab.Terminal.prototype, ['img/Terminal_out.png', 'img/Terminal_in.png', 'img/Terminal_hovered.png']),
        new Graphics.SpriteSourcePair(Lab.AndGate.prototype, ['img/AndGate.png']),
        new Graphics.SpriteSourcePair(Lab.NandGate.prototype, ['img/NandGate.png']),
        new Graphics.SpriteSourcePair(Lab.OrGate.prototype, ['img/OrGate.png']),
        new Graphics.SpriteSourcePair(Lab.XorGate.prototype, ['img/XorGate.png']),
        new Graphics.SpriteSourcePair(Lab.PowerSource.prototype, ['img/PowerSource.png']),
        // new Graphics.SpriteSourcePair(Lab.PushSwitch.prototype, ['img/PushSwitch_open.png', 'img/PushSwitch_closed.png']),
        // new Graphics.SpriteSourcePair(Lab.HoverSwitch.prototype, ['img/HoverSwitch.png']),
        // new Graphics.SpriteSourcePair(Lab.LightBulb.prototype, ['img/LightBulb_open.png', 'img/LightBulb_closed.png']),
        // new Graphics.SpriteSourcePair(Lab.LightScreen.prototype, ['img/LightScreen_open.png', 'img/LightScreen_closed.png']),
        new Graphics.SpriteSourcePair(Lab.CutterIcon.prototype, ['img/CUTTER_CLOSED.png', 'img/CUTTER_OPEN.png']),
        new Graphics.SpriteSourcePair(Lab.TrashcanIcon.prototype, ['img/TRASHCAN.png'])
    );

    return $;

});