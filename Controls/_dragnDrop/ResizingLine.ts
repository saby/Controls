import template = require('wml!Controls/_dragnDrop/ResizingLine/ResizingLine');

import {descriptor} from 'Types/entity';
// @ts-ignore
import {Container} from 'Controls/dragnDrop';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';

/*TODO Kingo*/
/**
 * Контрол, позволяющий визуально отображать процесс изменения других контролов при помощи перемещения мышью
 * @remark
 * Родительские DOM элементы не должны иметь overflow: hidden. В противном случае корректная работа не гарантируется.
 *
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less">переменные тем оформления</a>
 * 
 * @class Controls/_dragnDrop/ResizingLine
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @category DragnDrop
 * @demo Controls-demo/ResizingLine/Index
 */

/**
 * @event Controls/_toggle/Checkbox#offset Происходит после перетаскивания мыши, когда клавиша мыши отпущена
 * @param {Number|null} Значение сдвига
 * @remark Зависит от направления оси
 * @see direction
 */

type Direction = 'direct' | 'reverse';

export interface IResizingLineOptions extends IControlOptions {
    /**
     * @name Controls/_dragnDrop/ResizingLine#maxOffset
     * @cfg {Number} Максимальное значение сдвига при изменении значения размера
     * @default 1000
     * @remark
     * Сдвиг больше указанного визуально отображаться не будет. Для возможности сдвига вдоль направления оси maxOffset должен быть > 0
     */
    maxOffset: number;
    /**
     * @name Controls/_dragnDrop/ResizingLine#minOffset
     * @cfg {Number} Минимальное значение сдвига при изменении значения размера
     * @default 1000
     * @remark
     * Сдвиг меньше указанного визуально отображаться не будет. Для возможности сдвига против направления оси minOffset должен быть < 0
     */
    minOffset: number;
    /**
     * @name Controls/_dragnDrop/ResizingLine#direction
     * @cfg {String} Задает направление оси для сдвига
     * @variant direct Прямое направление. Слева направо
     * @variant reverse Обратное направление. Справа налево
     * @default direct
     * @remark
     * Влияет на то, каким будет результат события offset. Если сдвиг идет вдоль направления оси, offset положительный. Если против, то отрицательный
     * @see event offset()
     */
    direction: Direction;
}

interface IChildren {
    dragNDrop: Container;
}

interface IOffset {
    style: string;
    value: number;
}

class ResizingLine extends Control<IResizingLineOptions> {
    protected _children: IChildren;
    protected _options: IResizingLineOptions;
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
        this._dragging = true;
    }

    protected _onDragHandler(event: SyntheticEvent<MouseEvent>, dragObject): void {
        const offset = this._offset(dragObject.offset.x);
        const width = `${Math.abs(offset.value)}px`;

        dragObject.entity.offset = offset.value;
        this._styleArea = `width:${width};${offset.style};`;
    }

    protected _onEndDragHandler(event: SyntheticEvent<MouseEvent>, dragObject): void {
        if (this._dragging) {
            this._styleArea = '';
            this._dragging = false;
            this._notify('offset', [dragObject.entity.offset]);
        }
    }

    private _offset(x: number): IOffset {
        const {direction, minOffset, maxOffset} = this._options;

        if (x > 0 && direction === 'direct') {
            return {
                style: 'left: 100%',
                value: Math.min(x, Math.abs(maxOffset))
            }
        }
        if (x > 0 && direction === 'reverse') {
            return {
                style: 'left: 0',
                value: -Math.min(x, Math.abs(minOffset))
            }
        }
        if (x < 0 && direction === 'direct') {
            return {
                style: 'right: 0',
                value: -Math.min(-x, Math.abs(minOffset))
            }
        }
        if (x < 0 && direction === 'reverse') {
            return {
                style: 'right: 100%',
                value: Math.min(-x, Math.abs(maxOffset))
            }
        }

        return {
            style: '',
            value: 0
        };
    }

    // Use in template.
    protected _isResizing(minOffset: number, maxOffset: number): boolean {
        return minOffset !== 0 || maxOffset !== 0;
    }

    static _theme: string[] = ['Controls/dragnDrop'];

    static getDefaultTypes() {
        return {
            direction: descriptor(String).oneOf([
                'direct',
                'reverse'
            ]),
            minOffset: descriptor(Number),
            maxOffset: descriptor(Number)
        };
    }

    static getDefaultOptions(): object {
        return {
            minOffset: 1000,
            maxOffset: 1000,
            direction: 'direct'
        }
    }
}

export default ResizingLine;
