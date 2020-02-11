import {DataSet, Query, Remote} from 'Types/source';
import {IOptions as ILocalSourceOptions} from 'Types/_source/Local';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {fetch} from 'Browser/Transport';

interface IField {
    type: 'string' | 'number'; // TODO add date, Incremental etc
    randomData?: boolean;
    addId?: boolean;
    value?: any;
}
interface INumberField {
}
interface IStringField {
    wordsCount: number;
}

interface IItemPrototype {
    [key: string]: string | number | (IField & (INumberField|IStringField));
}

/* Позволяет сгенерировать список данных по заданному объекту-шаблону
 * @param itemsCount кол-во записей
 * @param itemProto шаблон для создания элементов
 * @param idProperty название ключевого поля
 * @param startIndex первый ключ для счётчика
 */
function getListData(itemsCount: number, itemProto: IItemPrototype = null, idProperty: string = 'id', startIndex: number = 0): any[] {
    const data = [];
    for (let i = startIndex; i < (itemsCount + startIndex); i++) {
        data.push(itemProto === null ? {[idProperty]: i} : _createItemByProto(itemProto, i, idProperty));
    }
    return data;
}

/* генерирует один элемент по шаблону
 * @param itemProto шаблон для создания элементов
 * @param id значение ключевого поля
 * @param idProperty название ключевого поля
 * @private
 */
function _createItemByProto(itemProto: IItemPrototype, id: number, idProperty: string = 'id'): {[p: string]: any} {
    const outItem: {[p: string]: any} = {};
    const isNeedId = itemProto && (itemProto[idProperty] === undefined);

    Object.keys(itemProto).forEach((key) => {
        const item: IField | string | number = itemProto[key];
        if (typeof item === 'object' && (item.type || item.value)) {
            const value = item.value !== undefined ? item.value : '';
            if (item.type === 'string') {
                if (item.randomData) {
                    outItem[key] = repeatText(Math.round(0.5 + Math.random() * 5));
                } else if (item.addId) {
                    outItem[key] = `${value}_${id}`;
                } else {
                    outItem[key] = value;
                }
            } else if (item.type === 'number') {
                outItem[key] = isNaN(value) ? 0 : value;
            } else {
                outItem[key] = item;
            }
        } else {
            outItem[key] = item;
        }
    });

    if (isNeedId) {
        outItem[idProperty] = id;
    }

    return outItem;
}

/*
 * Генерирует примитивный текст "рыбы"
 * @param count
 */
function repeatText(count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere nulla ex, consectetur lacinia odio blandit sit amet. ';
    }
    return result.trim();
}

export interface ISourceFakerOptions extends ILocalSourceOptions {

    /**
     * Сформированный внешне DataSet или массив объектов
     */
    data?: any[] | DataSet;

    /**
     * Должна ли принудитнельно генерироваться ошибка при любом запросе
     */
    failed?: boolean;

    /**
     * Время до срабатывания Promise resolve/reject
     */
    timeout?: number;

    /**
     * Настроййка для генератора: Индекс, начиная с которого необходимо генерировать данные
     */
    startIndex?: number;

    /**
     * Сколько записей необходимо сгенерировать
     */
    perPage?: number;

    /**
     * Прототип для генерации данных
     */
    itemModel?: IItemPrototype;
}

/**
 * Генератор фейковых данных с поддержкой принудительного возврата ошибки 403
 * SourceFaker.instance(options: ILocalSourceOptions, rawData: any[], mustFall: boolean)
 * @param options {
 *      filter:  (item: adapter.IRecord, query: object) => boolean;
 *      options: {debug: boolean};
 *      adapter?: string | adapter.IAdapter;
 *      model?: string | Function;
 *      listModule?: string | Function;
 *      keyProperty?: string;
 *      dataSetMetaProperty?: string;
 *      data?: any[] | DataSet;
 *      failed?: boolean;
 *      timeout?: number;
 *      startIndex?: number;
 *      perPage?: number;
 * }
 */
export class SourceFaker extends Remote {
    private _rawData: any[] | DataSet;
    private _timeOut: number;
    private _failed: boolean;
    private _offset: number;
    private readonly _itemModel: IItemPrototype;
    private readonly _cfg: ISourceFakerOptions;

    constructor(options?: ISourceFakerOptions) {
        super(options);
        this._cfg = options;
        this._offset = this._cfg.startIndex;
        if (!this._cfg.perPage) {
            this._cfg.perPage = 100;
        }
        if (this._cfg.itemModel) {
            this._itemModel = this._cfg.itemModel;
        } else {
            this._itemModel = {
                title: {
                    type: 'string',
                    value: 'Item',
                    addId: true
                },
                buyerId: {
                    value: 0,
                    type: 'number'
                },
                amount: {
                    value: 0,
                    type: 'number'
                }
            };
        }
        if (this._cfg.data) {
            this.setData(new DataSet({
                rawData: this._initRawData(this._cfg.startIndex || 0),
                keyProperty: this.getKeyProperty()
            }));
        } else {
            this.resetSource( this._cfg.startIndex || 0);
        }
        this.setTimeOut(this._cfg && this._cfg.timeout || 100);
        this.setFailed(this._cfg && this._cfg.failed);
    }

    create(meta?: object): Promise<Record> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject(this._generateError('create'));
                } else {
                    const _record = new Record();
                    _record.setRawData(meta);
                    resolve(_record);
                }
            }, this._timeOut);
        });
    }

    destroy(keys: number | string | number[] | string[], meta?: object): Promise<null> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject(this._generateError('destroy'));
                } else {
                    resolve(null);
                }
            }, this._timeOut);
        });
    }

    query(query?: Query): Promise<DataSet> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject(this._generateError('query'));
                } else {
                    resolve(this.querySync(query));
                }
            }, this._timeOut);
        });
    }

    read(key: number | string, meta?: object): Promise<Record> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject(this._generateError('read'));
                } else {
                    const _source = this.querySync().getAll();
                    resolve(_source.getRecordById(key));
                }
            }, this._timeOut);
        });
    }

    update(data: Record | RecordSet, meta?: object): Promise<null> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject(this._generateError('update'));
                } else {
                    resolve(null);
                }
            }, this._timeOut);
        });
    }

    /*
     * Устанавливает флаг "Всегда возвращать ошибку"
     * @param failed
     */
    setFailed(failed: boolean): void {
        this._failed = failed;
    }

    /*
     * Устанавливает данные в "чистом" виде или DataSet
     * @param data
     */
    setData(data: any[] | DataSet): void {
        this._rawData = data;
    }

    /*
     * Устанавливает время до возврата DataSet
     * @param timeOut
     */
    setTimeOut(timeOut: number): void {
        this._timeOut = timeOut;
    }

    /*
     * Синхронно возвращает DataSet
     */
    querySync(query?: Query): DataSet {
        if (query && query.getOffset() !== this._offset) {
            this.resetSource(query.getOffset());
        }
        if (this._rawData instanceof DataSet) {
            return this._rawData;
        }
        return new DataSet({
            rawData: this._rawData,
            keyProperty: this.getKeyProperty()
        });
    }

    /*
     * Синхронно возвращает данные в "чистом" виде
     */
    getRawData(): any[] {
        if (this._rawData instanceof DataSet) {
            return this._rawData.getRawData();
        }
        return this._rawData;
    }

    /**
     * Переустанавливает значения в ресурсе
     * @param startIndex
     */
    resetSource(startIndex: number = 0): SourceFaker {
        this._offset = startIndex;
        this.setData(new DataSet({
            rawData: this._initRawData(startIndex),
            keyProperty: this.getKeyProperty()
        }));
        return this;
    }

    private _initRawData(startIndex: number = 0): any[] {
        return getListData(this._cfg.perPage, this._itemModel, this.getKeyProperty(), startIndex);
    }

    private _generateError(action: string): fetch.Errors.HTTP {
        return new fetch.Errors.HTTP({
            url: `localhost/${action}`,
            httpError: 403,
            name: '403 Access Restricted',
            message: 'Доступ ограничен'
        });
    }

    static instance(options?: ISourceFakerOptions): SourceFaker {
        return new SourceFaker(options);
    }
}

export {
    IField,
    IItemPrototype,
    INumberField,
    IStringField,
    getListData,
    getListData as getGridData
};
