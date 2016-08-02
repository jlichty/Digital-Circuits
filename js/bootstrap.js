import {createDigitalLogicGameInstance} from './game/game.js';

var game = createDigitalLogicGameInstance(document.getElementById('game-canvas'));

game.start();