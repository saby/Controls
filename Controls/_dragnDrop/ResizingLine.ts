import template = require('wml!Controls/_dragnDrop/ResizingLine/ResizingLine');
import {descriptor} from 'Types/entity';
import {Container} from 'Controls/dragnDrop';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import IResizingLine from 'Controls/_dragnDrop/interface/IResizingLine';

/*TODO Kingo*/

interface IChildren {
    dragNDrop: Container;
}

interface IOffset {
    style: string;
    value: number;
}

const enum ORIENTATION {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal'
}
/**
 * Контрол, позволяющий визуально отображать процесс изменения других контролов при помощи перемещения мышью
 * @remark
 * Родительские DOM элементы не должны иметь overflow: hidden. В противном случае корректная работа не гарантируется.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/drag-n-drop/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less переменные тем оформления}
 *
 * @class Controls/_dragnDrop/ResizingLine
 * @extends UI/Base:Control
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ResizingLine/Index
 */
class ResizingLine extends Control<IControlOptions, IResizingLine> {
    protected _children: IChildren;
    protected _options: IResizingLine;
    protected _template: TemplateFunction = template;
    protected _styleArea: string = '';
    protected _dragging: boolean = false;

    protected _beginDragHandler(event: Event): void {
        // to disable selection while dragging
        event.preventDefault();
        // preventDefault for disable selection while dragging stopped the focus => active elements don't deactivated.
        // activate control manually
        this.activate();

        this._children.dragNDrop.startDragNDrop({
            offset: 0
        }, event, {
            /**
             * Во время перемещения отключается действие :hover на странице. Перемещение можно начать
             * сразу или после преодоления мыши некоторого расстояния. Если мышь во время движения выйдет за
             * пределы контрола, и будет над элементом со стилями по :hover, то эти стили применятся. Как только мышь
             * пройдет достаточно для начала перемещения, то стили отключатся. Произойдет моргание внешнего вида.
             * Чтобы такого не было нужно начинать перемещение сразу.
             */
            immediately: true
        });
    }

    protected _onStartDragHandler(): void {
        this.startDrag();
    }

    protected _onDragHandler(event: SyntheticEvent<MouseEvent>, dragObject): void {
        const offset = this._options.orientation === ORIENTATION.HORIZONTAL ? dragObject.offset.x : dragObject.offset.y;
        this.drag(offset);
        dragObject.entity.offset = this._offset(offset);
    }

    startDrag(): void {
        this._dragging = true;
        this._notify('dragStart');
    }

    drag(dragObjectOffset: number): void {
        const styleSizeName = this._options.orientation === ORIENTATION.HORIZONTAL ? 'width' : 'height';

        const offset = this._offset(dragObjectOffset);
        const sizeValue = `${Math.abs(offset.value)}px`;

        this._styleArea = `${styleSizeName}:${sizeValue};${offset.style};`;
    }

    endDrag(offset: number): void {
        if (this._dragging) {
            this._styleArea = '';
            this._dragging = false;
            this._notify('offset', [offset]);
        }
    }

    private _offset(x: number): IOffset {
        const {direction, minOffset, maxOffset} = this._options;
        let position;
        if (this._options.orientation === ORIENTATION.HORIZONTAL) {
            position = ['left', 'right'];
        } else {
            position = ['top', 'bottom'];
        }

        if (x > 0 && direction === 'direct') {
            return {
                style: `${position[0]}: 100%`,
                value: Math.min(x, Math.abs(maxOffset))
            };
        }
        if (x > 0 && direction === 'reverse') {
            return {
                style: `${position[0]}: 0`,
                value: -Math.min(x, Math.abs(minOffset))
            };
        }
        if (x < 0 && direction === 'direct') {
            return {
                style: `${position[1]}: 0`,
                value: -Math.min(-x, Math.abs(minOffset))
            };
        }
        if (x < 0 && direction === 'reverse') {
            return {
                style: `${position[1]}: 100%`,
                value: Math.min(-x, Math.abs(maxOffset))
            };
        }

        return {
            style: '',
            value: 0
        };
    }

    protected _onEndDragHandler(event: SyntheticEvent<MouseEvent>, dragObject): void {
        if (this._dragging) {
            this.endDrag(dragObject.entity.offset.value);
        }
    }

    // Use in template.
    protected _isResizing(minOffset: number, maxOffset: number): boolean {
        return minOffset !== 0 || maxOffset !== 0;
    }

    static _theme: string[] = ['Controls/dragnDrop'];

    static getDefaultTypes(): object {
        return {
            direction: descriptor(String).oneOf([
                'direct',
                'reverse'
            ]),
            minOffset: descriptor(Number),
            maxOffset: descriptor(Number),
            orientation: descriptor(String).oneOf([
                'vertical',
                'horizontal'
            ])
        };
    }

    static getDefaultOptions(): object {
        return {
            minOffset: 1000,
            maxOffset: 1000,
            direction: 'direct',
            orientation: 'horizontal'
        };
    }
}

Object.defineProperty(ResizingLine, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ResizingLine.getDefaultOptions();
   }
});

export default ResizingLine;
