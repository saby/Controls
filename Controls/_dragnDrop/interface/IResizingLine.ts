import {Direction} from 'Controls/_dragnDrop/Type/Direction';

/**
 * Интерфейс для контроллов, позволяющих визуально отображать процесс изменения других контролов при помощи перемещения мыши.
 *
 * @interface Controls/_dragnDrop/interface/IResizingLine
 * @public
 * @author Красильников А.С.
 */

export interface IResizingLine {
    readonly '[Controls/_dragnDrop/interface/IResizingLine]': boolean;
    maxOffset: number;
    minOffset: number;
    direction: Direction;
    orientation: string;
}

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#maxOffset
 * @cfg {Number} Максимальное значение сдвига при изменении значения размера
 * @default 1000
 * @remark
 * Сдвиг больше указанного визуально отображаться не будет. Для возможности сдвига вдоль направления оси maxOffset должен быть > 0
 */

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#minOffset
 * @cfg {Number} Минимальное значение сдвига при изменении значения размера
 * @default 1000
 * @remark
 * Сдвиг меньше указанного визуально отображаться не будет. Для возможности сдвига против направления оси minOffset должен быть < 0
 */

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#direction
 * @cfg {String} Задает направление оси для сдвига
 * @variant direct Прямое направление. Слева направо
 * @variant reverse Обратное направление. Справа налево
 * @default direct
 * @remark
 * Влияет на то, каким будет результат события offset. Если сдвиг идет вдоль направления оси, offset положительный. Если против, то отрицательный
 * @see event offset()
 */

/**
 * @name Controls/_dragnDrop/interface/IResizingLine#orientation
 * @cfg {String} Направление измнения размеров
 * @variant vertical Измнение размеров по вертикали
 * @variant horizontal Изменение размеров по горизонтале
 * @default horizontal
 */

/**
 * @event Происходит после перетаскивания мыши, когда клавиша мыши отпущена.
 * @name Controls/_dragnDrop/interface/IResizingLine#offset
 * @param {Number|null} offset Значение сдвига
 * @remark Зависит от направления оси
 * @see direction
 */
