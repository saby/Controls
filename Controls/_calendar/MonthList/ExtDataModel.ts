import {factory as chainFactory} from 'Types/chain';
import {Date as WSDate} from 'Types/entity';
import {ICrud, Query, DataSet, QueryNavigationType} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import dateRangeUtil = require('Controls/Utils/DateRangeUtil');
import monthListUtils from './Utils';
import {IDateConstructorOptions} from 'Controls/interface';

export interface IOptions extends IDateConstructorOptions {
   viewMode: string;
   source: ICrud;
}

export type TItems = RecordSet<Record>;

export default class ExtDataModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;
    protected _data: object = {};
    protected _viewMode: string;
    protected _source: ICrud;
    protected _dateConstructor: Function;

    constructor(options: IOptions) {
        super(options);
        this._viewMode = options.viewMode;
        this._source = options.source;
        this._dateConstructor = options.dateConstructor || WSDate;
    }

    invalidatePeriod(start: Date, end: Date): void {
        const loadedDates = this._getLoadedDatesIds()
            .map((dateId) =>  monthListUtils.idToDate(dateId, this._dateConstructor));

        for (const date of loadedDates) {
            if (date >= start && date <= end) {
                delete this._data[monthListUtils.dateToId(date)];
            }
        }
    }

    enrichItems(dates: number[]): Promise<TItems> | void {
        if (!this._source) {
            return;
        }

        let
            loadedDatesIds: number[] = this._getLoadedDatesIds()
                .map((dateId) =>  monthListUtils.idToDate(dateId).getTime()),
            newDatesIds: number[] = dates.filter((date) => loadedDatesIds.indexOf(date) === -1),
            start: Date,
            end: Date;

        if (newDatesIds.length) {
            start = new this._dateConstructor(Math.min.apply(null, newDatesIds));
            end = new this._dateConstructor(Math.max.apply(null, newDatesIds));
            return this._source.query(this._getQuery(start, end)).then(this._updateData.bind(this));
        }
    }

    getData(dateId: string): object {
        return this._data[monthListUtils.getClearDateId(dateId)];
    }

    private _getQuery(start: Date, end: Date): Query {
        let
            length: number = dateRangeUtil.getPeriodLengthInMonths(start, end),
            query: Query = new Query();

        if (this._viewMode === 'year') {
            end.setMonth(11);
            length = dateRangeUtil.getPeriodLengthInMonths(start, end);
        }
        start.setMonth(start.getMonth() - 1);

        query.meta({ navigationType: QueryNavigationType.Position });

        return query.where({'id>=': monthListUtils.dateToId(start)}).limit(length);
    }

    private _updateData(items: DataSet): void {
         const richItems = items.getAll();
         this.updateData(richItems);
         return richItems;
    }

    public updateData(items: TItems): TItems {
        const extData: object = {};

        if (this._viewMode === 'year') {
            chainFactory(items).each((item, index) => {
                const year: number = parseInt(item.getId().split('-')[0], 10);
                if (!extData[year]) {
                    extData[year] = [item.get('extData')];
                } else {
                    extData[year].push(item.get('extData'));
                }
            });
            for (const year of Object.keys(extData)) {
                this._data[monthListUtils.dateToId(new Date(parseInt(year, 10), 0))] = extData[year];
            }
        } else {
            chainFactory(items).each((item, index) => {
                this._data[item.getId()] = item.get('extData');
            });
        }
        this._nextVersion();
        return items;
    }

    protected _getLoadedDatesIds(): string[] {
        return Object.keys(this._data);
    }
}
