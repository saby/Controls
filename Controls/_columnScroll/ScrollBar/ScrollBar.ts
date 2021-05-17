import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/ScrollBar/ScrollBar';

export interface IScrollBarOptions extends IControlOptions {
    stickyHeader?: boolean;
    contentSize: number;
    backgroundStyle: string;
}

export default class ScrollBar extends Control<IScrollBarOptions> {
    protected _template: TemplateFunction = template;
    private _position: number = 0;
    private _contentSize: number = 0;
    private _scrollWidth: number = 0;

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
    setPosition(position: number): void {
        if (this._position !== position) {
            this._position = position;
            if (!this._options.gridNew) {
                this._notify('positionChanged', [this._position]);
            }
        }
    }

    setSizes(contentSize: number, scrollWidth: number, scrollPosition: number): void {
        let shouldRecalcSizes = false;

        if (this._contentSize !== contentSize) {
            this._contentSize = contentSize;
            shouldRecalcSizes = true;
        }

        if (this._scrollWidth !== scrollWidth) {
            this._scrollWidth = scrollWidth;
            shouldRecalcSizes = true;
        }

        if (this._position !== scrollPosition) {
            this._position = scrollPosition;
            shouldRecalcSizes = true;
        }

        if (shouldRecalcSizes) {
            this.recalcSizes();
        }
    }

    _afterUpdate(oldOptions) {
        if (oldOptions.scrollWidth !== this._options.scrollWidth) {
            this.recalcSizes();
        }
    }

    recalcSizes(): void {
        this._children.scrollbar.recalcSizes();
    }
    _onPositionChanged(e, newPosition): void {
        e.stopPropagation();
        this._position = Math.round(newPosition);
        this._notify('positionChanged', [this._position]);
    }
}
