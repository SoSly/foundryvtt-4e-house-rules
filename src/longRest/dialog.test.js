import {Suite} from '../app/Quench';

import {id} from '../../module.json';

Suite('longrest.dialog', DialogTest);
export default function DialogTest({describe, it, assert, beforeEach, afterEach, after}) {
    let actor = null;
    const LongRestDialog = game.sosly[id].apps.LongRestDialog;
    describe('long rest dialog', () => {
        after(async () => {
            game.messages.forEach(message => message.delete());
        });
        afterEach(async () => {
            await actor.delete();
            actor = undefined;
        });
        beforeEach(async () => {
            actor = await Actor.create({
                name: 'SoSly 4e House Rules Test Actor',
                type: 'Player Character',
            });
        });
        it('has a title', async () => {
            const dialog = new LongRestDialog(actor);
            assert.equal(dialog.title, `${actor.name} - Long Rest [SoSly]`);
        });
        it('gets data', async () => {
            const dialog = new LongRestDialog(actor);
            assert.equal(dialog.getData().system, dialog.object.system);
        });
        it('spends healing surges', async () => {
            actor.system.details.surges.value = 4;
            actor.system.details.surges.max = 8;

            const dialog = new LongRestDialog(actor);
            const event = new Event('submit');
            const formData = {surge: 2};
            await dialog._updateObject(event, formData);

            // 4 surges + 1 for rest - 2 for spend = 3 surges
            assert.equal(actor.system.details.surges.value, 3, 'Surges are spent');
        });

    });
}
