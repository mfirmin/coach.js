
var World     = require('./world/world');
var Simulator = require('./simulator/simulator');
var Renderer  = require('./renderer/renderer');

var Character = require('./character');

var entities  = require('./entity/index');
var joints    = require('./joint/index');

var controllers = require('./controller/index');
var utils     = require('./utils/utils');

var lib       = require('./lib/index');

var Coach = { "version": "0.0.0" };

Coach.World = World;
Coach.Renderer = Renderer;
Coach.Simulator = Simulator;

Coach.Character = Character;

Coach.entities = entities;
Coach.joints = joints;

Coach.controllers = controllers;

Coach.utils = utils;

Coach.lib = lib;

module.exports = Coach;
