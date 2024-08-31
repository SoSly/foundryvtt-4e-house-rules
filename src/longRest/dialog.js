import {Action} from './action';

import {id} from '../../module.json';


export class Dialog extends DocumentSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        return foundry.utils.mergeObject(options, {
            id: 'long-rest',
            classes: ['dnd4e', 'actor-rest'],
            template: `modules/${id}/templates/actor/long-rest.hbs`,
            width: 500,
            closeOnSubmit: true
        });
    }

    get title() {
        return `${this.object.name} - Long Rest [SoSly]`;
    }

    /** @override */
    getData() {
        return {
            benefits: game.i18n.translations.sosly.longRest.benefits,
            dailies: this.object.items
                .filter(item => item.type === 'power' && item.system.uses.per === 'day')
                .filter(item => item.system.uses.value < item.system.uses.max),
            system: this.object.system
        };
    }

    async _updateObject(event, formData) {
        const options = this.options;
        options.surge = formData.surge;
        options.bonus = formData.bonus;
        options.daily = formData.daily;

        await Action(this.object, options);
    }
}
