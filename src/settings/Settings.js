import { Logger } from '../app/Logger.js';

export const FEATURES = Object.freeze([
    'longRests'
]);

export class Settings {
    logger;
    module_id;

    constructor(module_id) {
        this.logger = Logger.getLogger();
        this.module_id = module_id;

        this.registerFeatures();
    }

    registerFeatures() {
        this.logger.groupCollapsed('Registering %d Features', FEATURES.length);
        FEATURES.forEach(feature => {
            this.register(feature);
            this.logger.info('%s Registered', game.i18n.localize(`fse.settings.${feature}.name`));
        });
        this.logger.groupEnd();
    }

    register(feature) {
        const data = {
            name: `sosly.settings.${feature}.name`,
            hint: `sosly.settings.${feature}.hint`,
            scope: 'world',
            config: true,
            type: new foundry.data.fields.BooleanField(),
            restricted: true,
            requiresReload: true,
        };

        game.settings.register(this.module_id, feature, data);
    }
}
