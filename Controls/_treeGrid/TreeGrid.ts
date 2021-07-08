import { View as Grid } from 'Controls/grid';
import { TreeControl } from 'Controls/tree';
import { TemplateFunction } from 'UI/Base';
import {Logger} from 'UI/Utils';
import { descriptor } from 'Types/entity';
import { CrudEntityKey } from 'Types/source';
import TreeGridView from 'Controls/_treeGrid/TreeGridView';
import TreeGridViewTable from 'Controls/_treeGrid/TreeGridViewTable';
import { Model } from 'Types/entity';
import { isFullGridSupport } from 'Controls/display';
import ITreeGrid, {IOptions as ITreeGridOptions} from 'Controls/_treeGrid/interface/ITreeGrid';
import 'css!Controls/grid';
import 'css!Controls/treeGrid';

/**
 * Контрол "Дерево" позволяет отображать данные из различных источников в виде иерархического списка.
 * Контрол поддерживает широкий набор возможностей, позволяющих разработчику максимально гибко настраивать отображение данных.
 * @remark
 * Дополнительно о контроле:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/tree/ руководство разработчика}
 * * {@link http://axure.tensor.ru/StandardsV8/%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%BE.html Спецификация Axure}
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FSingleExpand демо-пример с множественным выбором элементов и с единичным раскрытием содержимого папок}
 * * {@link /materials/Controls-demo/app/Controls-demo%2FList%2FTree%2FTreeWithPhoto демо-пример с пользовательским шаблоном элемента списка с фото}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_treeGrid.less переменные тем оформления treeGrid}
 * * {@link https://github.com/saby/wasaby-controls/blob/69b02f939005820476d32a184ca50b72f9533076/Controls-default-theme/variables/_list.less переменные тем оформления list}
 *
 * @mixes Controls/interface:ISource
 * @mixes Controls/list:IClickableView
 * @mixes Controls/interface/IPromisedSelectable
 * @mixes Controls/interface/IGroupedGrid
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/interface:IHierarchy
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/interface/ITreeGridItemTemplate
 * @mixes Controls/interface:IDraggable
 * @mixes Controls/interface:IGridControl
 * @mixes Controls/grid:IPropStorage
 * @mixes Controls/treeGrid:IReloadableTreeGrid
 *
 * @mixes Controls/list:IVirtualScrollConfig
 *
 *
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/treeGridNew/Base/TreeGridView/Index
 */
export default class TreeGrid extends Grid implements ITreeGrid {
    protected _viewName: TemplateFunction = null;
    protected _viewTemplate: TemplateFunction = TreeControl;

    _beforeMount(options: ITreeGridOptions): Promise<void> {

        if (options.groupProperty && options.nodeTypeProperty) {
            Logger.error('Нельзя одновременно задавать группировку через ' +
                'groupProperty и через nodeTypeProperty.', this);
        }

        if (!options.nodeProperty) {
            Logger.error('Не задана опция nodeProperty, обязательная для работы Controls/treeGrid:View', this);
        }

        if (!options.parentProperty) {
            Logger.error('Не задана опция parentProperty, обязательная для работы Controls/treeGrid:View', this);
        }

        const superResult = super._beforeMount(options);
        this._viewName = isFullGridSupport() ? TreeGridView : TreeGridViewTable;
        return superResult;
    }

    toggleExpanded(key: CrudEntityKey): Promise<void> {
        // @ts-ignore
        return this._children.listControl.toggleExpanded(key);
    }

    goToPrev(): Model {
        return this._children.listControl.goToPrev();
    }

    goToNext(): Model {
        return this._children.listControl.goToNext();
    }

    getNextItem(key: CrudEntityKey): Model {
        return this._children.listControl.getNextItem(key);
    }

    getPrevItem(key: CrudEntityKey): Model {
        return this._children.listControl.getPrevItem(key);
    }

    getDefaultAddParentKey(): CrudEntityKey | null {
        return this._children.listControl.getDefaultAddParentKey();
    }

    protected _getModelConstructor(): string {
        return 'Controls/treeGrid:TreeGridCollection';
    }

    static getOptionTypes(): object {
        return {
            parentProperty: descriptor(String).required()
        };
    }
}

/**
 * Загружает модель из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}, объединяет изменения в текущих данных и отображает элемент.
 * @name Controls/_treeGrid/TreeGrid#reloadItem
 * @function
 * @param {String} key Идентификатор элемента коллекции, который должен быть перезагружен из источника.
 * @param {Object} readMeta Метаинформация, которая будет передана методу запроса/чтения.
 * @param {String} direction Если аргумент установлен в значение "depth", то перезагрузка происходит с сохранением загруженных записей, т.е. они остаются в списке на клиенте.
 */
