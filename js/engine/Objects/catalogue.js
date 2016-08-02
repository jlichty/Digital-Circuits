import Component from './core/Component.js';

import Controller from './core/Controller.js';

import Entity from './core/Entity.js';

import EventEmitter from './core/EventEmitter.js';

import Loader from './core/Loader.js';

import Scene from './core/Scene.js';

import Repository from './core/Repository.js';

import System from './core/System.js';

import Tool from './core/Tool.js';

export default (function() {

    var objects = {
        Component,
        Controller,
        Entity,
        EventEmitter,
        Loader,
        Scene,
        Repository,
        System,
        Tool
    };

    return objects;

}());
