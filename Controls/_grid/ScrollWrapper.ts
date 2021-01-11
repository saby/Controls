import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_grid/ScrollWrapperTemplate';
import {_Scrollbar} from 'Controls/scroll';
import {SyntheticEvent} from 'Vdom/Vdom';
import {isFullGridSupport} from './utils/GridLayoutUtil';
import {Logger} from 'UI/Utils';

export interface IHorizontalScrollWrapperOptions extends IControlOptions {
    positionChangeHandler: (e: SyntheticEvent<null>, position: number) => void;
    topOffset: number;
    scrollWidth: number;
    listModel: IGridViewModel;
    gridSupport: 'no' | 'full' | 'partial';

    /**
     * Стиль background в случае sticky header
     */
    backgroundStyle: string;
}

export default class HorizontalScrollWrapper extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    private _gridStyle: string = null;
    protected _localPositionHandler: IHorizontalScrollWrapperOptions['positionChangeHandler'];
    private _needNotifyResize: boolean = true;
    private _shouldSetMarginTop: boolean = false;
    private _position: number = 0;

    protected _beforeMount(options: IHorizontalScrollWrapperOptions): void {
        this._localPositionHandler = options.positionChangeHandler;
        this._gridStyle = this._getGridStyles(options);
        const listModel = options.listModel;
        const hasHeaderOrTopResults = listModel.getHeader() || listModel.getResultsPosition() === 'top';
        this._shouldSetMarginTop = !!(options.gridSupport === 'full' && hasHeaderOrTopResults);
        if (!hasHeaderOrTopResults) {
            Logger.warn("ScrollWrapper: Don't use columnScroll without header or results rows");
        }
    }

    /*
    * Устанавливает позицию thumb'a.
    * Метод существует как временное решение ошибки ядра, когда обновлениие реактивного состояния родителя
    * приводит к перерисовке всех дочерних шаблонов, даже если опция в них не передается.
    * https://online.sbis.ru/opendoc.html?guid=5c209e19-b6b2-47d0-9b8b-c8ab32e133b0
    *
    * Ошибка ядра приводит к крайне низкой производительности горизонтального скролла(при изменении позиции
    * перерисовываются записи)
    * https://online.sbis.ru/opendoc.html?guid=16907a96-816e-4c76-9bdb-26bd6c4370b4
    *
    * После решения ошибки ядра, позиция thumb'a будет изменяться только по опциям, а _localPositionHandler
    * заменен на полноценный _notify.
    * _localPositionHandler - костыль созданный из за невозможности подписаться на событие не методом контрола,
    * а проброшенным методом. При горизонтальном скролле таблица оборачивается в отдельный шаблон с целью объединить
    * GridView, ColumnScroll и DragScroll.
    * */
    setPosition(position: number): void {
        if (this._position !== position) {
            this._position = position;
            if (this._localPositionHandler) {
                this._localPositionHandler(null, this._position);
            }
        }
    }

    protected _afterRender(): void {
        if (this._needNotifyResize) {
            (this._children.columnScrollbar as _Scrollbar).recalcSizes();
            this._notify('newPositionRendered', [this._position], {bubbling: true});
            this._needNotifyResize = false;
        }
    }

    _beforeUpdate(options: IHorizontalScrollWrapperOptions): void {
        if (typeof options.position === 'number' && this._position !== options.position) {
            this._position = options.position;
        }
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
        let lastCellOffset = 1;
        const listModel = options.listModel;
        // Учёт колонки с чекбоксами для выбора записей
        if (listModel.getMultiSelectVisibility() !== 'hidden') {
            offset += 1;
        }
        // Учёт колонки(или колонок) с лесенкой
        offset += listModel.stickyLadderCellsCount();

        if (listModel._shouldAddActionsCell()) {
            lastCellOffset += 1;
        }
        const stickyColumnsCount = listModel.getStickyColumnsCount();
        const columns = listModel.getColumns();
        // В случае !multiHeader добавление offset к grid-column-end не нужно, т.к. оно уже учтено в maxEndColumn
        style += `grid-column: ${stickyColumnsCount + 1 + offset} / ${(columns.length + lastCellOffset) + offset};`;
        style += `width: ${options.scrollWidth}px`;
        return style;
    }
}
