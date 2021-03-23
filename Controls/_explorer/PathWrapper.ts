import {EventUtils} from 'UI/Events';
import {Path} from 'Controls/_dataSource/calculatePath';
import {IHeaderCell} from 'Controls/_interface/grid/IHeaderCell';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_explorer/PathController/PathWrapper';

interface IOptions extends IControlOptions {
    items?: Path;
    header?: IHeaderCell[];

    needShadow?: boolean;
    stickyHeader?: boolean;

    style?: string;
    backgroundStyle?: string;

    rootVisible?: boolean;
    breadcrumbsVisibility?: 'hidden' | 'visible';
    afterBreadCrumbsTemplate?: string | TemplateFunction;
}

/**
 * * Рисует хлебные крошки и кастомный контент после них когда итемы для списка загружены
 */
export default class PathWrapper extends Control<IOptions> {
    protected _template: TemplateFunction = template;
    protected _needCrumbs: boolean = false;
    protected _withoutBackButton: boolean = false;
    protected _notifyHandler: typeof EventUtils.tmplNotify = EventUtils.tmplNotify;

    protected _beforeMount(options: IOptions): void {
        this._needCrumbs = PathWrapper._isNeedCrumbs(options);
        this._withoutBackButton = PathWrapper._isWithoutBackButton(options.header);
    }

    protected _beforeUpdate(newOptions: IOptions): void {
        const headerChanged = GridIsEqualUtil.isEqualWithSkip(
            this._options.header,
            newOptions.header,
            { template: true }
        );

        if (
            headerChanged ||
            this._options.items !== newOptions.items ||
            this._options.rootVisible !== newOptions.rootVisible ||
            this._options.breadcrumbsVisibility !== newOptions.breadcrumbsVisibility
        ) {
            this._needCrumbs = PathWrapper._isNeedCrumbs(newOptions);
        }

        if (headerChanged) {
            this._withoutBackButton = PathWrapper._isWithoutBackButton(newOptions.header);
        }
    }

    private static _isNeedCrumbs(options: IOptions): boolean {
        if (options.breadcrumbsVisibility === 'hidden') {
            return false;
        }

        const items = options.items;
        return !!items &&
            ((!PathWrapper._isWithoutBackButton(options.header) && items.length > 0) || items.length > 1) ||
            !!options.rootVisible;
    }

    private static _isWithoutBackButton(header: IHeaderCell[]): boolean {
        return !!(header && header[0] && (header[0] as any).isBreadCrumbs);
    }
}
