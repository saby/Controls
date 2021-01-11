/**
 * Created by as.krasilnikov on 10.09.2018.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popup/Opener/Edit/Container');
import {ContextOptions} from 'Controls/context';
import {RecordSet} from 'Types/collection';

interface IContainerContext {
    dataOptions: {
        items: RecordSet
    };
}
/**
 * Контрол используют в качестве контейнера для {@link Controls/popup:Edit}. Он получает данные и передаёт их в Controls/popup:Edit.
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 * 
 * @class Controls/_popup/Opener/Edit/Container
 * 
 * @extends UI/Base:Control
 * @see Controls/popup:Edit
 * @see Controls/list:DataContainer
 * @see Controls/popupTemplate:Stack
 * @see Controls/form:Controller
 * @public
 * @author Красильников А.С.
 * @remark
 * Подробнее об организации поиска и фильтрации в реестре читайте {@link /doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
 * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ здесь}.
 */
class Container extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _items: RecordSet;

    _beforeMount(options: IControlOptions, context: IContainerContext): void {
        this._updateItems(context);
    }
    _beforeUpdate(options: IControlOptions, context: IContainerContext): void {
        this._updateItems(context);
    }
    _updateItems(context: IContainerContext): void {
        if (context.dataOptions && context.dataOptions.items) {
            this._items = context.dataOptions.items;
        }
    }

    static contextTypes(): IContainerContext {
        return {
            dataOptions: ContextOptions
        };
    }
}

export default Container;
