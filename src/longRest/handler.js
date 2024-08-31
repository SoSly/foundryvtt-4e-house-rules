import {Dialog} from './dialog';
import {Action} from './action';

export function onActorSheetRendered(app, html, data) {
    const sheet = html[0];

    const extendedRestElement = sheet.querySelector('.attribute-surge footer .long-rest');

    // Move second wind next to heal
    const secondWindElement = sheet.querySelector('.attribute-surge footer .second-wind');
    const healElement = sheet.querySelector('.attribute-surge footer .heal-menu');
    secondWindElement.remove();
    healElement.insertAdjacentElement('beforeBegin', secondWindElement);

    // Insert a new long rest button
    const longRestElement = document.createElement('a');
    longRestElement.classList.add('rest');
    longRestElement.classList.add('sosly-long-rest');
    longRestElement.innerText = 'L. Rest'; // todo: i18n
    longRestElement.addEventListener('click', event =>
        onLongRestButtonClicked(event, app, html, data));
    extendedRestElement.insertAdjacentElement('beforeBegin', longRestElement);

    Hooks.call('soslyActorSheetRendered', app, html, data);
}

function onLongRestButtonClicked(event, app, html, data) {
    event.preventDefault();
    const isFF = game.helper.isRollFastForwarded(event);
    if (isFF) {
        return Action(app.actor, {isFF});
    }

    new Dialog(app.actor).render(true);
}
