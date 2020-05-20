import {QueryNavigationType} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';
import {IAdditionalQueryParams, Direction} from '../interface/IAdditionalQueryParams';
import {IQueryParamsController} from '../interface/IQueryParamsController';
import {Logger} from 'UI/Utils';
import {CursorDirection} from 'Controls/Constants';

import { Collection } from 'Controls/display';
import { IBasePositionSourceConfig } from 'Controls/interface';

interface IPositionHasMore {
    backward: boolean;
    forward: boolean;
    before?: boolean;
    after?: boolean;
}

declare type FieldCfg = any;
declare type Field = any[];
declare type PositionCfg = any;

/**
 * Позиция, от которой нужно начинать скролл
 * Является массивом из любых типов (number, date, string и тд)
 */
declare type Position = any[];

interface IPositionBoth {
    backward: Position;
    forward: Position;
    before?: Position;
    after?: Position;
}

declare type PositionBoth = Position | IPositionBoth;
declare type HasMore = boolean | IPositionHasMore;

export interface IPositionQueryParamsControllerOptions {
    field: FieldCfg;
    position: PositionCfg;
    direction: CursorDirection;
    limit: number;
}

/**
 * Навигация по курсору
 * @remark
 * Механизм ускоренной выборки записей из таблицы БД относительно т.н. курсора
 * (фиксированной записи списка).
 * Функционал может применяться для режима бесконечной подгрузки данных,
 * где курсором считается первая или последняя запись списка на странице при скролле вверх или вниз соответственно
 * @author Крайнов Дмитрий
 */
class PositionQueryParamsController implements IQueryParamsController {
    protected _more: HasMore;
    protected _beforePosition: Position = [null];
    protected _afterPosition: Position = [null];
    protected _shouldLoadLastPage: boolean = false;
    protected _options: IPositionQueryParamsControllerOptions;

    // TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
    protected _positionByMeta: boolean = null;

    constructor(cfg: IPositionQueryParamsControllerOptions) {
        this._options = cfg;

        if (this._options.field === undefined) {
            throw new Error('Option field is undefined in PositionQueryParamsController');
        }
        if (this._options.position === undefined) {
            throw new Error('Option position is undefined in PositionQueryParamsController');
        }
        if (this._options.direction === undefined) {
            throw new Error('Option direction is undefined in PositionQueryParamsController');
        }
        if (this._options.limit === undefined) {
            throw new Error('Option limit is undefined in PositionQueryParamsController');
        }
        this._more = this._getDefaultMoreMeta();
    }

    private _resolveDirection(loadDirection: Direction, optDirection: CursorDirection): CursorDirection {
        let navDirection: CursorDirection;
        if (loadDirection === 'down') {
            navDirection = CursorDirection.forward;
        } else if (loadDirection === 'up') {
            navDirection = CursorDirection.backward;
        } else {
            navDirection = optDirection;
        }
        return navDirection;
    }

    private _resolveField(optField: FieldCfg): Field {
        return (optField instanceof Array) ? optField : [optField];
    }

    private _resolvePosition(item: Record, optField: FieldCfg): Position {
        let navField: Field;
        let navPosition: Position;
        let fieldValue: any;

        navField = this._resolveField(optField);
        navPosition = [];
        for (let i = 0; i < navField.length; i++) {
            fieldValue = item.get(navField[i]);
            navPosition.push(fieldValue);
        }
        return navPosition;
    }

    private _getDefaultMoreMeta(): IPositionHasMore {
        return {
            backward: false,
            forward: false,
            before: false,
            after: false
        };
    }

    private _processMoreByType(more: HasMore, loadDirection?: Direction): void {
        let navDirection: CursorDirection;

        if (typeof more === 'boolean') {
            if (loadDirection || this._getDirection() !== CursorDirection.bothways) {
                navDirection = this._resolveDirection(loadDirection, this._getDirection());
                this._more[navDirection] = more;
            } else if (!loadDirection) {
                Logger.error('Wrong type of \"more\" value. Must be Object', 'Controls/_source/QueryParamsController/PositionQueryParamsController');
            }
        } else {
            if (more instanceof Object) {
                if (!loadDirection && this._getDirection() === CursorDirection.bothways) {
                    this._more = {...more};
                } else {
                    Logger.error('Wrong type of \"more\" value. Must be boolean', 'Controls/_source/QueryParamsController/PositionQueryParamsController');
                }
            }
        }
    }

    prepareQueryParams(loadDirection: Direction, callback?, config?: IBasePositionSourceConfig): IAdditionalQueryParams {
        let navDirection: CursorDirection;
        let navPosition: Position;
        let sign: string = '';
        let additionalFilter: object;
        let navField: Field;
        const limit = config?.limit || this._options.limit;

        navDirection = this._resolveDirection(loadDirection, this._getDirection(config?.direction));
        if (loadDirection === 'up') {
            navPosition = this._beforePosition;
        } else if (loadDirection === 'down') {
            navPosition = this._afterPosition;
        } else {
            if ((config?.position || this._options.position) instanceof Array) {
                navPosition = (config?.position || this._options.position);
            } else {
                navPosition = [(config?.position || this._options.position)];
            }
        }

        navField = this._resolveField(this._options.field);
        switch (navDirection) {
            case CursorDirection.forward:
                sign = '>=';
                break;
            case CursorDirection.backward:
                sign = '<=';
                break;
            case CursorDirection.bothways:
                sign = '~';
                break;
        }

        additionalFilter = {};
        for (let i = 0; i < navField.length; i++) {
            additionalFilter[navField[i] + sign] = navPosition[i];
        }

        const addParams: IAdditionalQueryParams = {
            filter: additionalFilter,
            limit,
            meta: {
                navigationType: QueryNavigationType.Position
            }
        };

        callback && callback({
            limit,
            position: navPosition
        });

        if (this._shouldLoadLastPage) {
            addParams.offset = -1;
        }

        return addParams;
    }

    /**
     * Позволяет установить параметры контроллера из Collection<Record>
     * @param model
     * TODO костыль https://online.sbis.ru/opendoc.html?guid=b56324ff-b11f-47f7-a2dc-90fe8e371835
     */
    /*
     * Allows manual set of current controller state using Collection<Record>
     * @param model
     */
    setState(model: Collection<Record>): void {
        if (!this._positionByMeta) {
            const beforePosition = model.getFirstItem();
            const afterPosition = model.getLastItem();
            if (afterPosition !== undefined) {
                this._afterPosition = this._resolvePosition(afterPosition, this._options.field);
            }
            if (beforePosition !== undefined) {
                this._beforePosition = this._resolvePosition(beforePosition, this._options.field);
            }
        }
        this._shouldLoadLastPage = false;
    }

    /**
     * Позволяет устанавить конфиг для контроллера навигации
     * @remark
     * @param config INavigationSourceConfig
     */
    /*
     * Allows to set navigation controller config
     * @remark
     * @param config INavigationSourceConfig
     */
    setConfig(config: IPositionQueryParamsControllerOptions): void {
        this._options = config;
    }

    /**
     * Вычисляет следующее состояние контроллера параметров запроса: следующую страницу, или позицию
     * @param list {Types/collection:RecordSet} объект, содержащий метаданные текущего запроса
     * @param direction {Direction} направление навигации ('up' или 'down')
     */
    /*
     * Calculates next query params controller state: next page, or position
     * @param list {Types/collection:RecordSet} object containing meta information for current request
     * @param direction {Direction} nav direction ('up' or 'down')
     */
    updateQueryProperties(list?: RecordSet | {[p: string]: unknown}, loadDirection?: Direction): void {
        let metaNextPosition: PositionBoth;
        let more: HasMore;

        // Look at the Types/source:DataSet there is a remark "don't use 'more' anymore"...
        let edgeElem: Record;
        const meta = (list as RecordSet).getMetaData();
        more = meta.more;
        metaNextPosition = meta.nextPosition;

        this._processMoreByType(more, loadDirection);

        // if we have "nextPosition" in meta we must set this position for next query
        // else we set this positions from records
        this._positionByMeta = null;
        if (metaNextPosition) {
            if (metaNextPosition instanceof Array) {
                if (loadDirection || this._getDirection() !== CursorDirection.bothways) {
                    if (loadDirection === 'down' || this._getDirection() === CursorDirection.forward) {
                        this._afterPosition = metaNextPosition;
                        this._positionByMeta = true;
                    } else if (loadDirection === 'up' || this._getDirection() === CursorDirection.backward) {
                        this._beforePosition = metaNextPosition;
                        this._positionByMeta = true;
                    }
                } else {
                    Logger.error('QueryParamsController/Position: Wrong type of \"nextPosition\" value. Must be object');
                }
            } else {
                if (!loadDirection && this._getDirection() === CursorDirection.bothways) {
                    if (metaNextPosition.before && metaNextPosition.before instanceof Array
                        && metaNextPosition.after && metaNextPosition.after instanceof Array) {
                        this._beforePosition = metaNextPosition.before;
                        this._afterPosition = metaNextPosition.after;
                        this._positionByMeta = true;
                    } else if (metaNextPosition.backward && metaNextPosition.backward instanceof Array
                        && metaNextPosition.forward && metaNextPosition.forward instanceof Array) {
                        this._beforePosition = metaNextPosition.backward;
                        this._afterPosition = metaNextPosition.forward;
                        this._positionByMeta = true;
                    } else {
                        Logger.error('QueryParamsController/Position: ' +
                            'Wrong type of \"nextPosition\" value. Must be Object width `before` and `after` properties.' +
                            'Each properties must be Arrays');
                    }
                } else {
                    Logger.error('QueryParamsController/Position: Wrong type of \"nextPosition\" value. Must be Array');
                }
            }

        } else {
            if ((list as RecordSet).getCount()) {
                if (loadDirection !== 'down') {
                    edgeElem = (list as RecordSet).at(0);
                    this._beforePosition = this._resolvePosition(edgeElem, this._options.field);
                }
                if (loadDirection !== 'up') {
                    edgeElem = (list as RecordSet).at((list as RecordSet).getCount() - 1);
                    this._afterPosition = this._resolvePosition(edgeElem, this._options.field);
                }
            }
        }
    }

    // TODO Not implemented
    getAllDataCount(rootKey?: string | number): boolean | number {
        return undefined;
    }

    // TODO Not implemented
    getLoadedDataCount(): number {
        return undefined;
    }

    hasMoreData(loadDirection: Direction, rootKey: string | number): boolean | undefined {
        let navDirection: CursorDirection;

        if (loadDirection === 'up') {
            navDirection = CursorDirection.backward;
        } else if (loadDirection === 'down') {
            navDirection = CursorDirection.forward;
        }

        return this._getMoreMeta()[navDirection];
    }

    setEdgeState(direction: Direction): void {
        if (direction === 'up') {
            // Не нужно ничего делать. При загрузке без указания direction
            // параметры direction и position будут взяты из переданных
            // опций, то есть из конфигурации navigation, что и приведет к
            // загрузке исходной страницы.
        } else if (direction === 'down') {
            this._shouldLoadLastPage = true;
        } else {
            throw new Error('Wrong argument Direction in NavigationController.ts::setEdgeState');
        }
    }

    destroy(): void {
        this._options = null;
        this._afterPosition = null;
        this._beforePosition = null;
        this._positionByMeta = null;
    }

    /**
     * Возвращает название напрвыления
     * @private
     */
    private _getDirection(direction?): CursorDirection {
        return PositionQueryParamsController._convertDirection(direction || this._options.direction);
    }

    /**
     * Получает moreMeta, совместимый с CursorDirection
     * TODO Необходимо убрать этот метод, когда своместимость более не понадобится
     * @param key
     * @private
     */
    private _getMoreMeta(): IPositionHasMore {
        const meta: IPositionHasMore = this._more as IPositionHasMore;
        if (meta && meta.backward === undefined) {
            meta.backward = meta.before;
        }
        if (meta && meta.forward === undefined) {
            meta.forward = meta.after;
        }
        return meta;
    }

    /**
     * Конвертор старых и новых названий направления.
     * TODO Необходимо убрать этот метод, когда своместимость более не понадобится
     * @param position
     */
    private static _convertDirection(position: CursorDirection | 'before' | 'after' | 'both'): CursorDirection {
        const map = {
            before: CursorDirection.backward,
            after: CursorDirection.forward,
            both: CursorDirection.bothways
        };
        return map[position] ? map[position] : position;
    }
}

export default PositionQueryParamsController;
