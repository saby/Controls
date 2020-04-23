import { Control, TemplateFunction } from 'UI/Base';
import { Memory, Query, DataSet } from 'Types/source';
import { adapter, Model } from 'Types/entity';
import { fetch } from 'Browser/Transport';
import * as template from 'wml!Controls-demo/dataSource/SearchAndRemove';
import { IItemAction, Remover } from 'Controls/list';
import { Confirmation } from 'Controls/popup';

interface IFilter {
    title?: string;
}

const getStandardError = () => Promise.reject(
    new fetch.Errors.HTTP({ url: '', httpError: 502, message: '' })
);

class TestSource extends Memory {
    query(filter: Query<IFilter>): Promise<DataSet> {
        const where = filter.getWhere() as unknown as IFilter;

        if (where.title === 'error') {
            return getStandardError();
        }

        return super.query(filter);
    }

    destroy(): Promise<null> {
        return getStandardError();
    }
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _filter: IFilter = {};
    protected _source: TestSource = new TestSource({
        keyProperty: 'id',
        data: [
            { id: '0', title: 'Abiens abi!' },
            { id: '1', title: 'Alea jacta est' },
            { id: '2', title: 'Acta est fabŭla.' },
            { id: '3', title: 'Aurea mediocrĭtas' },
            { id: '4', title: 'A mari usque ad mare' }
        ],
        filter: (item: adapter.IRecord, {title: desired}: IFilter) => desired
            ? item.get('title').toLowerCase().indexOf(desired) !== -1
            : true
    });
    protected _itemActions: IItemAction[] = [{
        id: '1',
        icon: 'icon-Erase',
        iconStyle: 'danger',
        showType: 2,
        title: 'Remove',
        handler: (item: Model) => {
            this._children.listRemover.removeItems([item.getKey()]);
        }
    }];
    protected _children: {
        listRemover: typeof Remover
    };
    protected _afterItemsRemove(event: unknown, idArray: string[]): boolean {
        if (idArray[0] !== '0') {
            return true;
        }

        Confirmation.openPopup({
            message: 'Нельзя удалить первый элемент!',
            style: 'danger',
            type: 'ok'
        });

        return false;
    }
}
