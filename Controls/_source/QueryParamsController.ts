import {IQueryParamsController} from 'Controls/_source/interface/IQueryParamsController';
import {IPageQueryParamsControllerOptions} from 'Controls/_source/QueryParamsController//PageQueryParamsController';
import {IPositionQueryParamsControllerOptions} from 'Controls/_source/QueryParamsController/PositionQueryParamsController';
import {RecordSet, List} from 'Types/collection';
import {Collection} from 'Controls/display';
import {Record} from 'Types/entity';
import {INavigationSourceConfig} from 'Controls/interface';
import {Direction, IAdditionalQueryParams} from 'Controls/_source/interface/IAdditionalQueryParams';

type Key = string|number|null;
type NavigationRecord = Record<{
    id: Key,
    nav_result: unknown
}>;
type Constructable =
    new(T: IPageQueryParamsControllerOptions | IPositionQueryParamsControllerOptions) => IQueryParamsController;

interface IControllerItem {
    id: Key;
    queryParamsController: IQueryParamsController;
}

export interface IQueryParamsControllerOptions {
    controllerClass: Constructable;
    controllerOptions: IPageQueryParamsControllerOptions | IPositionQueryParamsControllerOptions;
}

export default class QueryParamsController implements IQueryParamsController {
    _options: IQueryParamsControllerOptions = null;
    _controllers: List<IControllerItem> = null;

    constructor(options: IQueryParamsControllerOptions) {
        this._options = options;
        this._controllers = new List();
    }

    getAllDataCount(root?: Key): boolean | number {
        return this._getController(root).getAllDataCount();
    }

    getLoadedDataCount(root?: Key): number {
        return this._getController(root).getLoadedDataCount();
    }

    hasMoreData(direction: 'up' | 'down', root?: Key): boolean | undefined {
        return this._getController(root).hasMoreData(direction, root);
    }

    prepareQueryParams(direction: 'up' | 'down', multiNavigation: boolean): IAdditionalQueryParams {
        let result;

        if (multiNavigation) {
            result = [];
            this._controllers.forEach((item) => {
                result.push({
                    id: item.id,
                    queryParams: item.queryParamsController.prepareQueryParams(direction)
                });
            });
        } else {
            result = this._getController().prepareQueryParams(direction);
        }

        return result;
    }

    setConfig(config: INavigationSourceConfig, root?: Key): void {
        this._getController(root).setConfig(config);
    }

    setEdgeState(direction: 'up' | 'down', root?: Key): void {
        this._getController(root).setEdgeState(direction);
    }

    setState(model: Collection<Record>, root?: Key): void {
        this._getController(root).setState(model);
    }

    updateQueryProperties(list?: RecordSet, direction?: Direction, root?: Key): void {
        const more = list.getMetaData().more;
        let recordSetWithNavigation;

        if (more instanceof RecordSet) {
            more.each((nav: NavigationRecord) => {
                recordSetWithNavigation = new RecordSet();
                recordSetWithNavigation.setMetaData({
                    more: nav.get('nav_result')
                });
                this._getController(nav.get('id')).updateQueryProperties(recordSetWithNavigation, direction);
            });
        } else {
            this._getController(root).updateQueryProperties(list, direction);
        }
    }

    destroy(): void {
        this._controllers.each((item: IControllerItem) => {
            item.queryParamsController.destroy();
        });
        this._controllers = null;
    }

    private _getController(root?: Key): IQueryParamsController {
        let controllerItem = this._controllers.at(this._controllers.getIndexByValue('id', root));

        if (!controllerItem && !root) {
            controllerItem = this._controllers.at(0);
        }

        if (!controllerItem) {
            controllerItem = {
                id: root || null,
                queryParamsController: new this._options.controllerClass(this._options.controllerOptions)
            };
            this._controllers.add(controllerItem);
        }

        return controllerItem.queryParamsController;
    }

}
