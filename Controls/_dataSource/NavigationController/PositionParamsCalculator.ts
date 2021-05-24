import {QueryNavigationType} from 'Types/source';
import {default as PositionNavigationStore, IPositionNavigationState} from './PositionNavigationStore';
import {IBasePositionSourceConfig, IBaseSourceConfig, INavigationPositionSourceConfig} from 'Controls/interface';
import {TNavigationDirection, TNavigationPagingMode, IQueryParams} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {Record, Model} from 'Types/entity';
import {Logger} from 'UI/Utils';
import IParamsCalculator from './interface/IParamsCalculator';

// TODO Общие типы
type TPosition = any;
/**
 * Позиция, от которой нужно начинать скролл
 * Является массивом из любых типов (number, date, string и тд)
 */
type TPositionValue = any[];
type TField = string | string[];
type TFieldValue = string[];

const EDGE_FORWARD_POSITION = -1;
const EDGE_BACKWARD_POSITION = -2;

class PositionParamsCalculator implements IParamsCalculator {
    getQueryParams(
        store: PositionNavigationStore,
        config: INavigationPositionSourceConfig,
        direction?: TNavigationDirection,
        paramsCallback?: Function
    ): IQueryParams {
        const addParams: IQueryParams = {};
        addParams.meta = {navigationType: QueryNavigationType.Position};

        const storeParams = store.getState();
        addParams.limit = storeParams.limit;

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);

        let queryPosition;
        switch (direction) {
            case 'forward': queryPosition = storeParams.forwardPosition; break;
            case 'backward': queryPosition = storeParams.backwardPosition; break;
            default: {
                queryPosition = config.position ? config.position : storeParams.position;

                if (!Array.isArray(queryPosition)) {
                    queryPosition = [queryPosition];
                }
            }
        }

        const queryDirection = PositionParamsCalculator._resolveDirection(direction, storeParams.direction);
        let sign;
        switch (queryDirection) {
            case 'forward':
                sign = '>=';
                break;
            case 'backward':
                sign = '<=';
                break;
            case 'bothways':
                sign = '~';
                break;
        }

        const additionalFilter = {};
        for (let i = 0; i < queryField.length; i++) {
            additionalFilter[queryField[i] + sign] = queryPosition[i];
        }
        addParams.filter = additionalFilter;

        if (paramsCallback) {
            paramsCallback({
                position: queryPosition,
                limit: storeParams.limit
            });
        }
        // TODO lastpage

        return addParams;
    }

    updateQueryProperties(
        store: PositionNavigationStore,
        list: RecordSet,
        metaMore: object,
        config: IBasePositionSourceConfig,
        direction?: TNavigationDirection,
        listForCurrentStore: Model[] = [],
        additionalMeta: object = {}
    ): IPositionNavigationState  {
        const storeParams = store.getState();

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);
        let queryDirection = PositionParamsCalculator._resolveDirection(direction, storeParams.direction);

        if (config && config.position && config.position[0] === EDGE_FORWARD_POSITION) {
            queryDirection = PositionParamsCalculator._resolveDirectionForEdge(
                queryDirection,
                config.position,
                config
            );
        }

        if (typeof metaMore === 'boolean') {
            if (queryDirection !== 'bothways') {
                store.updateMetaMoreToDirection(queryDirection, metaMore);
            } else {
                Logger.error('NavigationController: Wrong type of \"more\" value. Must be Object');
            }
        } else {
            if (metaMore instanceof Object) {
                if (queryDirection === 'bothways') {
                    store.setMetaMore(metaMore);
                } else {
                    Logger.error('NavigationController: Wrong type of \"more\" value. Must be boolean');
                }
            }
        }

        const metaData = list.getMetaData();
        const metaNextPosition = additionalMeta.nextPosition || metaData.nextPosition;
        const metaIterative = metaData.iterative;

        store.setIterative(metaIterative);

        if (metaNextPosition) {
            if (metaNextPosition instanceof Array) {
                if (queryDirection !== 'bothways') {
                    if (queryDirection === 'forward') {
                        store.setForwardPosition(metaNextPosition);
                    } else if (queryDirection === 'backward') {
                        store.setBackwardPosition(metaNextPosition);
                    }
                } else {
                    Logger.error('NavigationController: Wrong type of \"nextPosition\" value. Must be object');
                }
            } else {
                if (queryDirection === 'bothways') {
                    if (metaNextPosition.before && metaNextPosition.before instanceof Array
                        && metaNextPosition.after && metaNextPosition.after instanceof Array) {
                        store.setBackwardPosition(metaNextPosition.before);
                        store.setForwardPosition(metaNextPosition.after);
                    } else if (metaNextPosition.backward && metaNextPosition.backward instanceof Array
                        && metaNextPosition.forward && metaNextPosition.forward instanceof Array) {
                        store.setBackwardPosition(metaNextPosition.backward);
                        store.setForwardPosition(metaNextPosition.forward);
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
            let edgeElem;
            if (list.getCount() && !(metaIterative && metaIterative !== storeParams.iterative)) {
                if (queryDirection !== 'forward') {
                    edgeElem = listForCurrentStore.shift() || list.at(0);
                    store.setBackwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
                if (queryDirection !== 'backward') {
                    edgeElem = listForCurrentStore.pop() || list.at(list.getCount() - 1);
                    store.setForwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
            } else {
                if (queryDirection !== 'forward') {
                    store.setBackwardPosition([null]);
                }

                if (queryDirection !== 'backward') {
                    store.setForwardPosition([null]);
                }
            }
        }
        return store.getState();
    }

    hasMoreData(store: PositionNavigationStore, direction: TNavigationDirection): boolean {
        let result: boolean;
        const more = store.getMetaMore();

        // moreResult === undefined, when navigation for passed rootKey is not defined
        if (more === undefined) {
            result = false;
        } else {
            return more[direction];
        }

        return result;
    }

    shiftToEdge(
        store: PositionNavigationStore,
        direction: TNavigationDirection,
        shiftMode: TNavigationPagingMode,
        navigationQueryConfig: IBasePositionSourceConfig
    ): IBaseSourceConfig {
        let position;
        let queryDirection;

        if (direction === 'backward') {
            if (shiftMode === 'edge' || shiftMode === 'end') {
                position = [EDGE_BACKWARD_POSITION];
            }
        } else if (direction === 'forward') {
            position = [EDGE_FORWARD_POSITION];
        }

        queryDirection = PositionParamsCalculator._resolveDirectionForEdge(
            direction,
            position,
            navigationQueryConfig
        );

        return {
            ...navigationQueryConfig,
            position,
            direction: queryDirection};
    }

    updateQueryRange(store: PositionNavigationStore, list: RecordSet, firstItem: Model, lastItem: Model): void {
        const metaNextPosition = list.getMetaData().nextPosition;

        if (!metaNextPosition) {
            const storeState = store.getState();
            const queryField = PositionParamsCalculator._resolveField(storeState.field);
            // TODO поправить, как будет вынесено добавление данных из BaseControl
            // https://online.sbis.ru/opendoc.html?guid=228eaa69-00f6-4ab0-83de-1e6c7fa47817
            const isIterative = storeState.iterative;

            if (!isIterative || storeState.backwardPosition[0] !== null) {
                store.setBackwardPosition(
                    PositionParamsCalculator._resolvePosition(firstItem, queryField)
                );
            }
            if (!isIterative || storeState.forwardPosition[0] !== null) {
                store.setForwardPosition(
                    PositionParamsCalculator._resolvePosition(lastItem, queryField)
                );
            }
        }
    }

    destroy(): void {
        return;
    }

    getAdditionalMeta(list: RecordSet, id?: string): object {
        const metaData = list.getMetaData();
        const metaNextPosition = metaData.nextPosition;
        let nextPosition;

        if (metaNextPosition instanceof RecordSet && id) {
            nextPosition = metaNextPosition.getRecordById(id).get('nav_result');
        } else {
            nextPosition = metaNextPosition;
        }

        return {nextPosition};
    }

    private static _resolveDirection(
        loadDirection: TNavigationDirection,
        optDirection: TNavigationDirection
    ): TNavigationDirection {
        let navDirection: TNavigationDirection;
        if (loadDirection === 'forward') {
            navDirection = 'forward';
        } else if (loadDirection === 'backward') {
            navDirection = 'backward';
        } else {
            navDirection = optDirection;
        }
        return navDirection;
    }

    private static _resolveField(optField: TField): TFieldValue {
        return (optField instanceof Array) ? optField : [optField];
    }

    private static _resolvePosition(item: Record, field: TFieldValue): TPositionValue {
        const navPosition: TPositionValue = [];
        for (let i = 0; i < field.length; i++) {
            navPosition.push(item.get(field[i]));
        }
        return navPosition;
    }

    private static _resolveDirectionForEdge(
        direction: TNavigationDirection,
        position: unknown[],
        navigationQueryConfig: IBasePositionSourceConfig
    ): TNavigationDirection {
        let queryDirection;

        if (direction === 'forward' && position[0] === EDGE_FORWARD_POSITION) {
            queryDirection = 'backward';
        } else {
            queryDirection = direction;
        }

        return queryDirection;
    }

}

export default PositionParamsCalculator;
