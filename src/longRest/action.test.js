import {Suite} from '../app/Quench';

import {id} from '../../module.json';

Suite('longrest.action', ActionTest);
export default function ActionTest({describe, it, assert, beforeEach, afterEach, after}) {
    const LongRestAction = game.sosly[id].actions.LongRestAction;

    describe('player characters can take a long rest', () => {
        let actor = null;
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
        it('restores surges', async () => {
            actor.system.details.surges.value = 2;
            actor.system.details.surges.max = 8;
            await LongRestAction(actor, {});
            assert.equal(actor.system.details.surges.value, 3, 'Surges are restored');
        });
        it('resets temporary hit points', async () => {
            actor.system.attributes.temphp.value = 5;
            await LongRestAction(actor, {});
            assert.equal(actor.system.attributes.temphp.value, null, 'Temporary hit points are reset');
        });
        it('resets magic item uses', async () => {
            actor.system.magicItemUse.dailyuse = 0;
            await LongRestAction(actor, {});
            assert.equal(actor.system.magicItemUse.dailyuse, 1, 'Magic item uses are reset');
        });
        it('resets second wind', async () => {
            actor.system.details.secondwind = true;
            await LongRestAction(actor, {});
            assert.equal(actor.system.details.secondwind, false, 'Second wind is reset');
        });
        it('resets action points', async () => {
            actor.system.actionpoints.encounteruse = true;
            await LongRestAction(actor, {});
            assert.equal(actor.system.actionpoints.encounteruse, false, 'Action points are reset');
        });
        it('resets magic item uses', async () => {
            actor.system.magicItemUse.encounteruse = true;
            await LongRestAction(actor, {});
            assert.equal(actor.system.magicItemUse.encounteruse, false, 'Magic item uses are reset');
        });
        it('resets death save failures', async () => {
            actor.system.details.deathsavefail = 1;
            game.settings.set('dnd4e', 'deathSaveRest', 1);
            await LongRestAction(actor, {});
            assert.equal(actor.system.details.deathsavefail, 0, 'Death save failures are reset');
        });
        it('heals using surges', async () => {
            actor.system.details.surges.value = 4;
            actor.system.details.surges.max = 8;
            await LongRestAction(actor, {surge: 2});
            // 4 surges + 1 for rest - 2 for spend = 3 surges
            assert.equal(actor.system.details.surges.value, 3, 'Surges are spent');
        });
        it('heals using surges with bonus', async () => {
            actor.system.details.surges.value = 4;
            actor.system.details.surges.max = 8;
            await LongRestAction(actor, {surge: 2, bonus: '2d6'});
            // 4 surges + 1 for rest - 2 for spend = 3 surges
            assert.equal(actor.system.details.surges.value, 3, 'Surges are spent');
        });
        it('recharges encounter powers', async () => {
            const items = [
                {name: 'Encounter Power', type: 'power', system: {uses: {value: 0, max: 1, per: 'enc'}}},
                {name: 'Encounter Power', type: 'power', system: {uses: {value: 0, max: 1, per: 'enc'}}},
            ];
            for (const item of items) {
                await Item.create(item, {parent: actor});
            }
            await LongRestAction(actor, {});
            const recharged = actor.items.filter(item => item.system.uses.value === 1);
            assert.equal(recharged.length, 2, 'Encounter powers are recharged');
        });
        it('recharges a selected daily power', async () => {
            const items = [
                {name: 'Daily Power', type: 'power', system: {uses: {value: 0, max: 1, per: 'day'}}},
                {name: 'Daily Power', type: 'power', system: {uses: {value: 0, max: 1, per: 'day'}}},
            ];
            for (const item of items) {
                const {id} = await Item.create(item, {parent: actor});
                item.id = id;
            }
            await LongRestAction(actor, {daily: items[0].id});
            assert.equal(actor.items.get(items[0].id).system.uses.value, 1, 'Daily power is recharged');
        });
        it('creates a chat message', async () => {
            const size = game.messages.size;
            await LongRestAction(actor, {});
            assert.equal(game.messages.size, size + 1, 'Chat message is created');
        });
        it('calls soslyActorLongRest when the method is called', async () => {
            const rendered = new Promise(resolve => {
                Hooks.once('soslyActorLongRest', async () => resolve(true));
            });
            LongRestAction(actor, {});
            await assert.eventually.isOk(rendered, 'soslyActorLongRest is called');
        });
    });
}
