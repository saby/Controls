import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/SlowAdding/SlowAdding';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import {editing} from 'Controls/Constants';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _lastItemId: number = 1;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    beforeBeginEditTitle: 'Записи не редактируются, только добавление. Добавление начнется с задержкой. ' +
                        'Например, долгая валидация на сервере(3 секунды), появится индикатор. При этом редактированию, не был возвращен Promise.'
                }
            ]
        });

        const originCreate = this._viewSource.create.bind(this._viewSource);
        const originUpdate = this._viewSource.update.bind(this._viewSource);
        this._viewSource.create = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2500);
            }).then(() => {
                return new Model({
                    keyProperty: 'id',
                    rawData: {
                        id: ++this._lastItemId,
                        beforeBeginEditTitle: 'Редактирование завершится после задержки в 3 сек. Например, долгая валидация на сервере, появится индикатор. При этом, не был возвращен Promise.'
                    }
                });
            });
        };
        this._viewSource.update = (item: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(item);
                }, 2500);
            }).then(originUpdate);
        };
    }

    protected _beforeBeginEdit(e: SyntheticEvent<null>, {item}: {item: Model}, isAdd: boolean): string | undefined {
        if (!isAdd) {
            return editing.CANCEL;
        }
    }

    protected _addItem(): void {
        //@ts-ignore
        this._children.list.beginAdd();
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
