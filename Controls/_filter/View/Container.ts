import {Control} from 'UI/Base';
import * as template from 'wml!Controls/_filter/View/Container';
import {default as Store} from 'Controls/Store';
/**
 * Контрол используют в качестве контейнера для {@link Controls/filter:View}. Он обеспечивает передачу параметров фильтрации между {@link Controls/filter:Controller} и {@link Controls/filter:View}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления</a>
 * 
 *
 * @class Controls/_filter/View/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @control
 * @public
 */

/*
 * Special container for {@link Controls/_filter/View}.
 * Listens for child's "itemsChanged" event and notify bubbling event "filterChanged".
 * Receives props from context and pass to {@link Controls/_filter/View}.
 * NOTE: Must be located inside Controls/_filter/Controller.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/filter-search/'>here</a>.
 *
 * @class Controls/_filter/View/Container
 * @extends Core/Control
 * @author Герасимов А.М.
 * @control
 * @public
 */

/**
 * @event Controls/_filter/View/Container#filterItemsChanged Происходит при изменении элементов.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Object} items Новые элементы.
 */

/*
 * @event Controls/_filter/View/Container#filterItemsChanged Happens when items changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Object} items New items.
 */

var Container = Control.extend(/** @lends Controls/_filter/View/Container.prototype */{

    _template: template,

    _beforeMount(options): void {
        if (options.useStore) {
            this._source = Store.getState().filterSource;
        }
    },

    _itemsChanged(event: Event, items): void {
       event.stopPropagation();
       if (this._options.useStore) {
           Store.dispatch('filterSource', items);
       } else {
           this._notify('filterItemsChanged', [items], {bubbling: true});
       }
    },

   _filterChanged(event: Event): void {
      event.stopPropagation();
   },

    _historyApply(event: Event, history): void {
        this._notify('filterHistoryApply', [history], {bubbling: true});
    }
});

export default Container;
