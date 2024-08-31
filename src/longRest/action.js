export async function Action(actor, options) {
    const updateData = {};
    const tier = Math.ceil(actor.system.details.level / 10);

    if (game.settings.get('dnd4e', 'deathSaveRest') <= 1) {
        updateData['system.details.deathsavefail'] = 0;
    }

    updateData['system.attributes.temphp.value'] = '';
    updateData['system.magicItemUse.milestone'] = 0;
    updateData['system.magicItemUse.dailyuse'] = actor.system.magicItemUse.perDay;

    updateData['system.details.secondwind'] = false;
    updateData['system.actionpoints.encounteruse'] = false;
    updateData['system.magicItemUse.encounteruse'] = false;

    let surges = actor.system.details.surges.value;
    let healamount = 0;
    if (options.surge > 0) {
        if (options.surge > actor.system.details.surges.value) {
            options.surge = actor.system.details.surges.value;
        }

        let r = new Roll('');
        for (let i = 0; i < options.surge; i++) {
            if (options.bonus !==('') && options.bonus !== undefined) {
                r = new Roll(options.bonus);
                try {
                    await r.roll();
                }
                catch {
                    ui.notifications.error(game.i18n.localize('DND4E.InvalidHealingBonus'));
                    r = new Roll('0');
                    await r.roll();
                }
            }
            healamount += actor.system.details.surgeValue + (r.total || 0);
        }

        if (healamount) {
            updateData['system.attributes.hp.value'] = Math.min(
                (Math.max(0, actor.system.attributes.hp.value) + healamount),
                actor.system.attributes.hp.max
            );
        }

        if (actor.system.details.surges.value > 0) {
            surges = actor.system.details.surges.value - options.surge;
        }
    }

    updateData['system.details.surges.value'] = Math.min(surges + tier, actor.system.details.surges.max);

    const dailyPower = actor.items.find(item => item.id === options.daily);
    if (dailyPower) {
        await dailyPower.update({'system.uses.value': 1});
    }
    await game.helper.rechargeItems(actor, ['enc']);
    await game.helper.endEffects(actor, ['endOfTargetTurn', 'endOfUserTurn', 'startOfTargetTurn', 'startOfUserTurn', 'endOfEncounter', 'endOfDay', 'endOfUserCurrent']);

    for (let r of Object.entries(actor.system.resources)) {
        if (r[1].sr && r[1].max) {
            updateData[`system.resources.${r[0]}.value`] = r[1].max;
        }
    }

    await actor.update(updateData);
    Hooks.call('soslyActorLongRest', actor, updateData, options);

    let content = [];
    content.push(game.i18n.format('sosly.longRest.chat.message', {name: actor.name}));
    if (options.daily) {
        content.push(game.i18n.format('sosly.longRest.chat.daily', {name: actor.name, power: dailyPower.name}));
    }
    if (options.surge >= 1) {
        if (options.bonus) {
            content.push(game.i18n.format('sosly.longRest.chat.surgeWithBonus', {
                name: actor.name,
                surges: options.surge,
                hp: healamount,
                bonus: options.bonus
            }));
        }
        else {
            content.push(game.i18n.format('sosly.longRest.chat.surge', {
                name: actor.name,
                surges: options.surge,
                hp: healamount
            }));
        }
    }

    if (actor.type === 'Player Character') {
        await ChatMessage.create({
            user: game.user.id,
            speaker: {actor: actor, alias: actor.system.name},
            content: content.join('<br />'),
        });
    }
}
