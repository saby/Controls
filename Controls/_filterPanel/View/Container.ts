import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanel/View/Container';

/**
 * Контрол используют в качестве контейнера для {@link Controls/filterPanel:View}. Обеспечивает передачу параметров фильтрации между {@link Controls/filter:Controller} и {@link Controls/filterPanel:View}.
 * @class Controls/_filterPanel/View/Container
 * @extends Core/Control
 * @author Мельникова Е.А.
 *
 * @public
 */

export default class Container extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    /**
     * @event Происходит при изменении элементов.
     * @name Controls/_filterPanel/View/Container#filterItemsChanged
     * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
     * @param {Object} items Новые элементы.
     */
    protected _sourceChanged(event: Event, items: object[]): void {
       event.stopPropagation();
       this._notify('filterItemsChanged', [items], {bubbling: true});
    }
}
