import { Control, TemplateFunction } from 'UI/Base';
import { Memory, Query, DataSet } from 'Types/source';
import { adapter, Model } from 'Types/entity';
import { fetch } from 'Browser/Transport';
import * as template from 'wml!Controls-demo/dataSource/SearchAndRemove';
import { Remover } from 'Controls/list';
import { IItemAction } from 'Controls/itemActions';
import { Confirmation } from 'Controls/popup';
import {INavigationOptionValue, INavigationPageSourceConfig} from 'Controls/_interface/INavigation';
import 'css!Controls-demo/Controls-demo';

interface IFilter {
    title?: string;
}

enum ErrorType {
    serviceError = 502,
    connection = 0
}

const getStandardError = (type: ErrorType = ErrorType.serviceError) => {
    let result;

    if (type === ErrorType.connection) {
        result = new fetch.Errors.Connection('');
    } else if (type === ErrorType.serviceError) {
        result = new fetch.Errors.HTTP({ url: '', httpError: 502, message: '' });
    }

    return Promise.reject(result);
};

class TestSource extends Memory {
    private _lostConnection: boolean = false;

    query(filter: Query<IFilter>): Promise<DataSet> {
        const where = filter.getWhere() as unknown as IFilter;

        if (this._lostConnection) {
            return getStandardError(ErrorType.connection);
        }

        if (where.title === 'error') {
            return getStandardError(ErrorType.serviceError);
        }

        return super.query(filter);
    }

    destroy(): Promise<null> {
        return getStandardError();
    }

    loseConnection(lose: boolean = false): void {
        this._lostConnection = lose;
    }
}

function getSourceData(): object[] {
    const count = 100;
    const data = [];

    for (let i = 0; i < count; i++) {
        data.push({ id: String(i), title: 'Element_' + i });
    }

    return data;
}

function getSource(): TestSource {
    return new TestSource({
        keyProperty: 'id',
        data: getSourceData(),
        filter: (item: adapter.IRecord, {title: desired}: IFilter) => desired
            ? item.get('title').toLowerCase().indexOf(desired) !== -1
            : true
    });
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _filter: IFilter = {};
    protected _lostConnection: boolean = false;
    protected _source: TestSource = getSource();

    protected _navigation: INavigationOptionValue<INavigationPageSourceConfig> = {
        source: 'page',
        sourceConfig: { hasMore: false, page: 5, pageSize: 10 },
        view: 'infinity', // infinity, pages, demand
        viewConfig: {
            pagingMode: 'direct'
        }
    };

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

    protected _afterUpdate(): void {
        this._source.loseConnection(this._lostConnection);
    }

    protected _resetSource(): void {
        this._source = getSource();
        this._lostConnection = false;
    }

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

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
