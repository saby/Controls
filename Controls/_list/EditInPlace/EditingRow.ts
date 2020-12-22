import {Control, TemplateFunction} from 'UI/Base.js';
import * as template from 'wml!Controls/_list/EditInPlace/EditingRow';
import { constants } from 'Env/Env';

export default class EditingRow extends Control {
    protected _template: TemplateFunction = template;

    protected _onKeyDown(event): void {
        this._notify('editingRowKeyDown', [event.nativeEvent], {bubbling: true});

        // Так как наша система событий ловит события на стадии capture,
        // а подписки в БТРе на стадии bubbling, то не нужно звать stopPropagation
        // так как обработчики БТРа в таком случае не отработают, потому что
        // у события не будет bubbling фазы
        // TODO: Нужно поправить после исправления https://online.sbis.ru/opendoc.html?guid=cefa8cd9-6a81-47cf-b642-068f9b3898b7
        // Don't stop propagation event with tab-key, it breaks the moving focus by tab/shift+tab.
        // Stop propagation on escape, because it should only be used to cancel edit in place
        if (
            event.nativeEvent.keyCode === constants.key.esc ||
            !event.target.closest('.richEditor_TinyMCE') && event.nativeEvent.keyCode !== constants.key.tab
        ) {
            event.stopPropagation();
        }
    }

    protected _stopMouseEvent(e): void {
        /*
         Останавливаем всплытие любых кликов, если строка редактируется. Если клики будут всплывать, то их будет ловить список
         и генерировать событие itemClick, которое не должно стрелять на редактируемой строке.
         Был ещё другой вариант: останавливать клик на поле ввода. Тогда возникают несколько проблем:
         - На каждом компоненте, который будет лежать внутри редактируемой строки, придется останавливать всплытие.
         - Другие компоненты (например, TouchDetector) могут следить за кликами на поле ввода, т.е. безусловный stopPropagation сломал бы ту логику.
         */
        // e.stopPropagation();

        /*
          Мы не можем остановить всплытие клика по настоящему, т. к. система событий работает на фазе захвата,
          из-за чего если мы позовем stopPropagation, то обработчики, повешенные на фазе всплытия (например tinymce),
          не будут запущены, так как эта фаза всплытия нативного события запущена не будет.
          TODO: Нужно убрать когда добавят возможность подписываться на разных фазах
          https://online.sbis.ru/doc/cefa8cd9-6a81-47cf-b642-068f9b3898b7
        */
        e.stopped = true;
    }
}
