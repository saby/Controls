import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_grid/ScrollWrapperTemplate';
import Scrollbar from 'Controls/_scroll/Scroll/Scrollbar';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isFullGridSupport} from './utils/GridLayoutUtil';

export interface IHorizontalScrollWrapperOptions extends IControlOptions {
    positionChangeHandler: (e: SyntheticEvent<null>, position: number) => void;
    topOffset: number;
    scrollWidth: number;
    listModel: IGridViewModel;
    gridSupport: 'no' | 'full' | 'partial';
}

export default class HorizontalScrollWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _gridStyle: string = null;
    private _localPositionHandler: IHorizontalScrollWrapperOptions['positionChangeHandler'];
    private _needNotifyResize: boolean = false;

    protected _beforeMount(options: IHorizontalScrollWrapperOptions): void {
        this._localPositionHandler = options.positionChangeHandler;
        this._gridStyle = this._getGridStyles(options);
    }

    protected _afterRender(): void {
        if (this._needNotifyResize) {
            (this._children.columnScrollbar as Scrollbar).recalcSizes();
            this._needNotifyResize = false;
        }
    }

    _beforeUpdate(options: IHorizontalScrollWrapperOptions): void {
        const newStyle = this._getGridStyles(options);
        if (this._gridStyle !== newStyle) {
            this._gridStyle = newStyle;
            this._needNotifyResize = true;
        }
    }

    private _getGridStyles(options: IHorizontalScrollWrapperOptions): string {
        if (!isFullGridSupport()) {
            return '';
        }
        let style = '';
        let offset = 0;
        const listModel = options.listModel;
        if (listModel.getMultiSelectVisibility() !== 'hidden') {
            offset += 1;
        }
        const maxEndColumn = listModel.getHeaderMaxEndColumn();
        const stickyColumnsCount = listModel.getStickyColumnsCount();
        const isMultiHeader = listModel.isMultiHeader();

        style += `grid-column: ${stickyColumnsCount + 1 + offset} / ${(isMultiHeader ? maxEndColumn : maxEndColumn + 1) + offset};`;
        style += `width: ${options.scrollWidth}px`;
        return style;
    }
}
