import {IQueryParams, Direction} from 'Controls/_interface/IQueryParams';
import {QueryNavigationType} from 'Types/source';
import {default as PageNavigationStore, IPageNavigationState} from './PageNavigationStore';
import {IBasePageSourceConfig, INavigationPageSourceConfig} from 'Controls/interface';
import {TNavigationDirection} from 'Controls/_interface/INavigation';
import {RecordSet} from 'Types/collection';
import IParamsCalculator from './interface/IParamsCalculator';

class PageParamsCalculator implements IParamsCalculator {
    getQueryParams(
        store: PageNavigationStore,
        config: INavigationPageSourceConfig,
        direction?: TNavigationDirection
    ): IQueryParams {
        const addParams: IQueryParams = {};
        addParams.meta = {navigationType: QueryNavigationType.Page};

        const storeParams = store.getState();

        let page;
        switch (direction) {
            case 'forward': page = storeParams.nextPage; break;
            case 'backward': page = storeParams.prevPage; break;
            default: page = config.page ? config.page : storeParams.page;
        }
        const pageSize = config.pageSize ? config.pageSize : storeParams.pageSize;

        addParams.offset = page * pageSize;
        addParams.limit = pageSize;

        if (storeParams.hasMore === false) {
            addParams.meta.hasMore = false;
        }

        // TODO callback

        return addParams;
    }

    updateQueryProperties(
        store: PageNavigationStore,
        list: RecordSet,
        metaMore: number | boolean,
        config: IBasePageSourceConfig,
        direction?: TNavigationDirection
    ): IPageNavigationState  {
        const storeParams = store.getState();

        PageParamsCalculator._validateNavigation(metaMore, storeParams.hasMore);
        store.setMetaMore(metaMore);

        switch (direction) {
            case 'forward': store.shiftNextPage(); break;
            case 'backward': store.shiftPrevPage(); break;
            default: {
                // Если направление не указано,
                // значит это расчет параметров после начальной загрузки списка или после перезагрузки
                if (config) {
                    // TODO обработать эту ситуацию
                    const pageSizeRemainder = config.pageSize % storeParams.pageSize;
                    const pageSizeCoef = (config.pageSize - pageSizeRemainder) / storeParams.pageSize;

                    if (pageSizeRemainder) {
                        throw new Error('pageSize, переданный для единичной перезагрузки списка, должен нацело делиться на pageSize из опции navigation.sourceConfig.');
                    }

                    // если мы загрузили 0 страницу размера 30 , то мы сейчас на 2 странице размера 10
                    store.setCurrentPage((config.page + 1) * pageSizeCoef - 1);
                }
            }
        }
        return store.getState();
    }

    hasMoreData(store: PageNavigationStore, direction: TNavigationDirection): boolean {
        let result: boolean;
        const storeParams = store.getState();
        const more = store.getMetaMore();

        if (direction === 'forward') {

            // moreResult === undefined, when navigation for passed rootKey is not defined
            if (more === undefined) {
                result = false;
            } else {
                if (storeParams.hasMore === false) {
                    // в таком случае в more приходит общее число записей в списке
                    // значит умножим номер след. страницы на число записей на одной странице и сравним с общим
                    result = typeof more === 'boolean'
                        ? more
                        : storeParams.nextPage * storeParams.pageSize < more;
                } else {
                    result = !!more;
                }
            }
        } else if (direction === 'backward') {
            result = storeParams.prevPage >= 0;
        } else {
            throw new Error('Parameter direction is not defined in hasMoreData call');
        }

        return result;
    }

    shiftToEdge(store: PageNavigationStore, direction: TNavigationDirection): void {
        if (direction === 'backward') {
            store.setCurrentPage(0);
        } else if (direction === 'forward') {
            const metaMore = store.getMetaMore();

            if (typeof metaMore === 'number') {
                store.setCurrentPage(metaMore / store.getState().pageSize - 1);
            } else {
                store.setCurrentPage(-1);
            }
        }
    }

    updateQueryRange(store: PageNavigationStore): void {
        // do not need to update
    }

    destroy(): void {
        return;
    }

    private static _validateNavigation(hasMoreValue: boolean | number, hasMoreOption: boolean): void {
        if (hasMoreOption === false) {
            // meta.more can be undefined is is not error
            if (hasMoreValue && (typeof hasMoreValue !== 'number')) {
                throw new Error('"more" Parameter has incorrect type. Must be numeric');
            }
        } else {
            // meta.more can be undefined is is not error
            if (hasMoreValue && (typeof hasMoreValue !== 'boolean')) {
                throw new Error('"more" Parameter has incorrect type. Must be boolean');
            }
        }
    }
}

export default PageParamsCalculator;
