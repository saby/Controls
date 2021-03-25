// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_list/ItemsView';
import {Model} from 'Types/entity';
import {EventUtils} from 'UI/Events';
import {IMovableList} from 'Controls/list';
import {RecordSet} from 'Types/collection';
import {EntityKey} from 'Types/_source/ICrud';
import {DataSet, LOCAL_MOVE_POSITION} from 'Types/source';
import {default as BaseControl} from 'Controls/_list/BaseControl';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ISelectionObject} from 'Controls/_interface/ISelectionType';

/**
 * Опции для контрола {@link ItemsView}
 * @author Уфимцев Д.Ю.
 */
export interface IItemsViewOptions extends IControlOptions {
    /**
     * @cfg Список записей данные которого нужно отобразить в списке
     */
    items?: RecordSet;
}

/**
 * Контрол плоского списка, который умеет работать по {@link RecordSet}
 * @author Уфимцев Д.Ю.
 */
export default class ItemsView extends Control<IItemsViewOptions> implements IMovableList {
    //region base control props
    protected _template: TemplateFunction = template;

    protected _children: {
        baseControl: BaseControl
    };
    //endregion

    //region private helper props
    /**
     * Инстанс дочернего Controls.list:BaseControl
     */
    private get _baseControl(): BaseControl {
        return this._children.baseControl;
    }
    //endregion

    //region helper props for the template
    /**
     * Обработчик который используется в шаблоне для проксирования событий логическому родителю.
     */
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;
    //endregion

    //region proxy methods to BaseControl
    beginAdd(userOptions: { item: Model }): void {
        this._baseControl.beginAdd(userOptions);
    }

    //region IMovableList
    moveItems(selection: ISelectionObject, targetKey: EntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._baseControl.moveItems(selection, targetKey, position);
    }

    moveItemDown(selectedKey: EntityKey): Promise<void> {
        return this._baseControl.moveItemDown(selectedKey);
    }

    moveItemUp(selectedKey: EntityKey): Promise<void> {
        return this._baseControl.moveItemUp(selectedKey);
    }

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
        return this._baseControl.moveItemsWithDialog(selection);
    }
    //endregion
    //endregion
}
