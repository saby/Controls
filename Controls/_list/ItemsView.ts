// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_list/ItemsView';
import {Memory} from 'Types/source';
import {Model, Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {default as BaseControl} from 'Controls/_list/BaseControl';
import {NewSourceController} from 'Controls/dataSource';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

interface IOptions extends IControlOptions {
    items?: RecordSet;
}

class FakeSource extends Memory {
    update(data: Record | RecordSet, meta?: object): Promise<void> {
        return Promise.resolve();
    }
}

export default class ItemsView extends Control<IOptions, void> {
    //region base control props
    protected _template: TemplateFunction = template;

    protected _children: {
        baseControl: BaseControl
    };
    //endregion

    //region property settings for list base control
    /**
     * keyProperty вычисленная на основании переданных items
     */
    protected _keyProperty: string;

    /**
     * Фейковый источник данных. Нужен для того, что бы BaseControl:
     *  * проставил _items в _prepareItemsOnMount
     *  * был использован при вызове методов при создании/редактировании по месту и при удалении
     */
    protected _source: FakeSource;

    /**
     * Используется только для того что бы передать item при первой инициализации
     */
    protected _sourceController: NewSourceController;
    //endregion

    //region life circle hooks
    protected _beforeMount(options?: IOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._source = new FakeSource();

        if (options?.items) {
            this._applyItems(options.items);
        }
    }

    protected _beforeUpdate(options?: IOptions): void {
        const newItems = options?.items;
        if (newItems !== this._options.items) {
            this._applyItems(newItems);
        }
    }

    protected _beforeUnmount(): void {
        this._sourceController?.destroy();
    }
    //endregion

    /**
     * Обновляет внутреннее состояние в соответствии с переданными items
     */
    private _applyItems(items: RecordSet): void {
        this._updateKeyProperty(items);
        // 1. Пересоздаем sourceController т.к. его setItems делает assign в существующий RecordSet,
        // что ломает поведение.
        // 2. В прямую вызывать assignItemsToModel у BaseControl тоже не вариант т.к. все равно надо
        // менять итемы в sourceController иначе на _beforeUpdate применятся старые item из sourceController
        this._updateSourceControllerItems(items);
    }

    /**
     * На основании переданных items обновляет поле _keyProperty,
     * которое передается в BaseControl в одноименную опцию
     */
    private _updateKeyProperty(items: RecordSet): void {
        const newKeyProperty = items?.getKeyProperty();
        if (this._keyProperty !== newKeyProperty) {
            this._keyProperty = newKeyProperty;
        }
    }

    /**
     * Пересоздает sourceController и присваивает в него переданные items
     */
    private _updateSourceControllerItems(items: RecordSet): void {
        this._sourceController?.destroy();
        this._sourceController = new NewSourceController({source: this._source});
        this._sourceController.setItems(items);
    }

    //region proxy methods
    beginAdd(userOptions: { item: Model }): void {
        this._children.baseControl.beginAdd(userOptions);
    }
    //endregion
}
