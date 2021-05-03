/**
 * Created by as.krasilnikov on 10.09.2018.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popup/Opener/Edit/Container');
import { IContextOptionsValue } from 'Controls/context';
import { RecordSet } from 'Types/collection';

interface IContainerOptions extends IControlOptions {
    _dataOptionsValue: IContextOptionsValue;
}
/**
 * Контрол используют в качестве контейнера для {@link Controls/popup:Edit}. Он получает данные и передаёт их в Controls/popup:Edit.
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
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
 * Подробнее об организации поиска и фильтрации в реестре читайте {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-and-search/ здесь}.
 * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ здесь}.
 */
class Container extends Control<IContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _items: RecordSet;

    _beforeMount(options: IContainerOptions): void {
        this._updateItems(options);
    }
    _beforeUpdate(options: IContainerOptions): void {
        this._updateItems(options);
    }
    _updateItems(options: IContainerOptions): void {
        if (options._dataOptionsValue && options._dataOptionsValue.items) {
            this._items = options._dataOptionsValue.items;
        }
    }
}

export default Container;
