import {FEATURES} from './Settings';
import {Suite} from '../app/Quench';

import {id} from '../../module.json';

Suite('settings', SettingsTest);
export default function SettingsTest({describe, it, assert}) {
    describe('all features are registered', () => {
        const features = Object.values(FEATURES);

        for (const feature of features) {
            it(`registers ${feature} as a boolean value`, () => {
                const setting = game.settings.get(id, feature);
                assert.ok(setting !== undefined, `feature ${feature} is registered`);
                assert.ok(typeof setting === 'boolean', `feature ${feature} is a boolean`);
            });
        }
    });
}
