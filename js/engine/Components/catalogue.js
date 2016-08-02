import CollidableComponent from './core/CollidableComponent.js';

import DrawableComponent from './core/DrawableComponent.js';

import ImageComponent from './core/ImageComponent.js';

import InputComponent from './core/InputComponent.js';

import LineComponent from './core/LineComponent.js';

import MeshComponent from './core/MeshComponent.js';

import MotionComponent from './core/MotionComponent.js';

import PickableComponent from './core/PickableComponent.js';

import PoseComponent from './core/PoseComponent.js';

import SpriteComponent from './core/SpriteComponent.js';

export default (function() {

    var components = {
        CollidableComponent,
        DrawableComponent,
        ImageComponent,
        InputComponent,
        LineComponent,
        MeshComponent,
        MotionComponent,
        PickableComponent,
        PoseComponent,
        SpriteComponent
    };

    return components;

}());