import {Control, TemplateFunction} from 'UI/Base';
import LookupTemplate = require('wml!Controls/_filterPopup/Panel/HierarchyLookup/HierarchyLookup');

import {factory} from 'Types/chain';

/**
 * Обертка над контролом {@link Controls/_filterPopup/Panel/Lookup Controls/filterPopup:Lookup} для работы с иерархическим фильтром.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления</a>
 *
 * @class Controls/_filterPopup/Panel/HierarchyLookup
 * @extends Core/Control
 * @mixes Controls/_interface/IMultiSelectable
 * @control
 * @public
 * @author Золотова Э.Е.
 *
 */

/**
 * @name Controls/_filterPopup/Panel/HierarchyLookup#keyProperty
 * @cfg {String} Имя свойства, уникально идентифицирующего элемент коллекции.
 */

/**
 * @name Controls/_filterPopup/Panel/HierarchyLookup#parentProperty
 * @cfg {String} Имя свойства, содержащего информацию о родительском узле элемента.
 */

class HierarchyLookup extends Control {
    protected _template: TemplateFunction = LookupTemplate;
    protected _selectedKeys: number[] | string[];

    protected _beforeMount(options): void {
        this._selectedKeys = options.selectedKeys ? factory(options.selectedKeys).flatten().value() : options.selectedKeys;
    }

    protected _beforeUpdate(newOptions): void {
        if (newOptions.selectedKeys && this._options.selectedKeys !== newOptions.selectedKeys) {
            this._selectedKeys = newOptions.selectedKeys ? factory(newOptions.selectedKeys).flatten().value() : newOptions.selectedKeys;
        }
    }

    protected _itemsChanged(event, items): void {
        if (items) {
            let self = this;
            let selectedKeys = {};
            factory(items).each((item) => {
                let parentId = item.get(self._options.parentProperty) || item.get(self._options.keyProperty);
                selectedKeys[parentId] = selectedKeys[parentId] || [];
                selectedKeys[parentId].push(item.get(self._options.keyProperty));
            });
            this._notify('selectedKeysChanged', [selectedKeys]);
        }
    }

    static _theme: string[] = ['Controls/filterPopup'];
}

export default HierarchyLookup;