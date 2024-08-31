import {Suite} from '../app/Quench';

Suite('longrest.handler', HandlerTest);
export default function HandlerTest({describe, it, assert, after, afterEach, beforeEach}) {
    describe('actor sheet renders', () => {
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
        it('calls soslyActorSheetRendered when the sheet is rendered', async () => {
            const rendered = new Promise(resolve => {
                Hooks.once('soslyActorSheetRendered', () => resolve(true));
            });
            actor.sheet.render(true);
            await assert.eventually.isOk(rendered, 'Actor sheet rendered');
        });
        it('moves second wind next to heal', async () => {
            const rendered = new Promise(resolve => {
                Hooks.once('soslyActorSheetRendered', (app, [sheet], data) => {
                    const buttons = sheet.querySelector('.attribute-surge footer').children;
                    let secondWind = 0;
                    let heal = 0;
                    for (let index = 0; index < buttons.length; index++) {
                        if (buttons[index].classList.contains('second-wind')) {
                            secondWind = index;
                        }
                        if (buttons[index].classList.contains('heal-menu')) {
                            heal = index;
                        }
                    }
                    resolve(secondWind === heal - 1);
                });
            });
            actor.sheet.render(true);
            await assert.eventually.isOk(rendered, 'second wind is next to heal');
        });
        it('inserts a new long rest button', async () => {
            actor.system.details.surges.value = 2;
            actor.system.details.surges.max = 8;

            const rendered = new Promise(resolve => {
                Hooks.once('soslyActorSheetRendered', async (app, [sheet], data) => {
                    const longRestButton = sheet.querySelector('.attribute-surge footer .sosly-long-rest');
                    const event = new PointerEvent('click', {shiftKey: true});
                    longRestButton.dispatchEvent(event);
                });
                Hooks.once('soslyActorLongRest', async () => resolve(actor.system.details.surges.value));
            });

            actor.sheet.render(true);
            await assert.eventually.equal(rendered, 3, 'long rest calls Actor.soslyLongRest');
        });
        it('opens a dialog when the long rest button is clicked', async () => {
            const rendered = new Promise(resolve => {
                Hooks.once('soslyActorSheetRendered', async (app, [sheet], data) => {
                    const longRestButton = sheet.querySelector('.attribute-surge footer .sosly-long-rest');
                    longRestButton.click();
                });
                Hooks.once('renderDialog', async () => resolve(true));
            });

            actor.sheet.render(true);
            await assert.eventually.isOk(rendered, 'long rest button opens dialog');
        });
    });
}
