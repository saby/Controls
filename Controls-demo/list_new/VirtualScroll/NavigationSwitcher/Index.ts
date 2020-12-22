import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/VirtualScroll/NavigationSwitcher/NavigationSwitcher';
import {CursorDirection} from 'Controls/list';
import { INavigation } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';

export interface INavigationSwitcherOptions extends IControlOptions {
    content?: TemplateFunction;
    pageSize?: number;
    page?: number;
    totalCount: number;
    direction?: CursorDirection;
}

export class NavigationSwitcher extends Control<INavigationSwitcherOptions> {
    protected _template: TemplateFunction = Template;
    protected _navigation: INavigation = null;

    _beforeMount(newOptions: INavigationSwitcherOptions): void {
        this._navigation = this.getNavigation({
            direction: newOptions.direction,
            pageSize: newOptions.pageSize,
            page: newOptions.page,
            totalCount: newOptions.totalCount
        });
    }

    protected _switchNavigation(e: SyntheticEvent, pageSize?: number): void {
        this._navigation = this.getNavigation({
            pageSize,
            totalCount: this._options.totalCount
        });
    }

    private getNavigation(cfg: {
        pageSize?: INavigationSwitcherOptions['pageSize'],
        direction?: INavigationSwitcherOptions['direction'],
        page?: INavigationSwitcherOptions['page'],
        totalCount: INavigationSwitcherOptions['totalCount']
    }): INavigation {
        // tslint:disable-next-line
        const pageSize = cfg.pageSize || this._options.pageSize || 100;

        return {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                direction: cfg.direction || this._options.direction || undefined,
                pageSize,
                page: this._calcPage(cfg.page || this._options.page || 0, pageSize, cfg.totalCount),
                hasMore: false
            }
        };
    }

    private _calcPage(page: number, pageSize: number, totalCount: number): number {
        if (page === 0 || (page * pageSize <= totalCount)) {
            return page;
        } else {
            return Math.ceil(totalCount / pageSize);
        }
    }

}

export default NavigationSwitcher;
