import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/ScrollBar/ScrollBar';
import {JS_SELECTORS} from './../ColumnScrollController';

export interface IScrollBarOptions extends IControlOptions {
    stickyHeader?: boolean;
    backgroundStyle: string;
}

export default class ScrollBar extends Control<IScrollBarOptions> {
    protected _template: TemplateFunction = template;
    private _position: number = 0;
    private _contentSize: number = 0;
    private _scrollWidth: number = 0;
    private readonly _fixedClass = JS_SELECTORS.FIXED_ELEMENT;

    /*
    * Устанавливает позицию thumb'a.
    * Метод существует как временное решение ошибки ядра, когда обновлениие реактивного состояния родителя
    * приводит к перерисовке всех дочерних шаблонов, даже если опция в них не передается.
    * https://online.sbis.ru/opendoc.html?guid=5c209e19-b6b2-47d0-9b8b-c8ab32e133b0
    *
    * Ошибка ядра приводит к крайне низкой производительности горизонтального скролла(при изменении позиции
    * перерисовываются записи)
    * https://online.sbis.ru/opendoc.html?guid=16907a96-816e-4c76-9bdb-26bd6c4370b4
    */
    setScrollPosition(scrollPosition: number): void {
        this.setSizes({scrollPosition});
    }

    // Аналогично this.setScrollPosition, та же причина существования
    setSizes(params: {contentSize?: number, scrollWidth?: number, scrollPosition?: number}): void {
        let shouldRecalcSizes = false;

        if (typeof params.contentSize !== 'undefined' && this._contentSize !== params.contentSize) {
            this._contentSize = params.contentSize;
            shouldRecalcSizes = true;
        }

        if (typeof params.scrollWidth !== 'undefined' && this._scrollWidth !== params.scrollWidth) {
            this._scrollWidth = params.contentSize;
            shouldRecalcSizes = true;
        }

        if (typeof params.scrollPosition !== 'undefined' && this._position !== params.scrollPosition) {
            this._position = params.scrollPosition;
        }

        if (shouldRecalcSizes) {
            this._recalcSizes();
        }
    }

    private _recalcSizes(): void {
        this._children.scrollbar.recalcSizes();
    }

    protected _onDraggingChanged(e, isDragging): void {
        if (!isDragging) {
            this._notify('dragEnd', []);
        }
    }

    protected _onPositionChanged(e, newPosition: number): void {
        e.stopPropagation();
        this._position = Math.round(newPosition);
        this._notify('positionChanged', [this._position]);
    }
}
