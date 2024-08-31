import {Logger, LogLevels} from '/Logger';
import {Action as LongRestAction} from '../longRest/action';
import {onActorSheetRendered} from '../longRest/handler';
import {Settings} from '../settings/Settings';
import {Dialog as LongRestDialog} from '../longRest/dialog';

export class App {
    id;
    name;
    version;

    logger;
    settings;

    constructor(id, title, version) {
        this.id = id;
        this.name = title;
        this.version = version;

        this.logger = Logger.getLogger(this.name, LogLevels.Debug);

        game.sosly = game.sosly || {};
        game.sosly[this.id] = {
            actions: {
                LongRestAction
            },
            apps: {
                LongRestDialog
            }
        };
    }

    async ready() {
        this.logger.debug('Version %s Ready', this.version);
    }

    async setup() {
        this.settings = new Settings(this.id);

        Hooks.on('renderActorSheet4e', onActorSheetRendered);
    }
}
