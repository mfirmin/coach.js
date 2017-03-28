import controllers from './controller/index';
import Character   from './character';
import entities    from './entity/index';
import joints      from './joint/index';
import Renderer    from './renderer/renderer';
import Simulator   from './simulator/simulator';
import World       from './world/world';
import utils       from './utils/utils';

import lib         from './lib/index';

const Coach = {
    version: '0.0.1',

    controllers,
    entities,
    joints,
    utils,

    Character,
    Renderer,
    Simulator,
    World,

    lib,
};

export default Coach;
