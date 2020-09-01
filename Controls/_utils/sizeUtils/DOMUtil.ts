import {throttle} from 'Types/function';
import {constants} from 'Env/Env';
import {getWidth} from 'Controls/_utils/sizeUtils/getWidth';

const MINIMAL_DEVICE_REFLOW_DELAY = 100;
const DECIMAL = 10;

/**
 * Функция вызывающая forced reflow с корня DOM-дерева
 */
export const reflow = throttle(() => {
    if (constants.isBrowserPlatform) {
        document.body.style.transform = 'translate(0px)';

        setTimeout(() => {
            document.body.style.transform = '';
        }, MINIMAL_DEVICE_REFLOW_DELAY);
    }
}, MINIMAL_DEVICE_REFLOW_DELAY, true);

/**
 * Returns the internal width of the element (that is, after deduction the borders, padding and scroll bars)
 * @param {window.Node} container
 * @return {window.Number}
 */
export function width(container: HTMLElement | unknown): number {
    let computedStyle;
    let containerWidth;

    // toDO Проверка на jQuery до исправления этой ошибки https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
    // @ts-ignore
    if (window.jQuery && container instanceof window.jQuery) {
        containerWidth = container.width();

        // @ts-ignore
    } else if (container instanceof window.Node) {
        containerWidth = container.clientWidth;

        if (window.getComputedStyle) {
            computedStyle = window.getComputedStyle(container);
            containerWidth -= parseInt(computedStyle.paddingLeft, DECIMAL) + parseInt(computedStyle.paddingRight, DECIMAL);
        }
    }

    return containerWidth;
}

/**
 * Вычисляет горизонтальные размеры ещё не отрисованных элементов, переданных в первом аргументе
 * Создаёт HTML контейнер с содержимым переданных в itemsHtml элементов и вычисляет гориз. размер каждого элемента
 * с учётом props.
 * @param itemsHtml массив строк HTML, которые необходимо измерить до отрисовки
 * @param itemClass CSS класс элементов которые необходимо измерить
 * @param considerMargins Учитывать ли margin left/right
 */
export function getElementsWidth(
    itemsHtml: string[],
    itemClass: string,
    considerMargins?: boolean): number[] {
    const itemsSizes: number[] = [];
    const measurer: HTMLElement = document.createElement('div');
    measurer.innerHTML = itemsHtml.join('');
    measurer.style.position = 'absolute';
    measurer.style.left = '-10000px';
    measurer.style.top = '-10000px';
    document.body.appendChild(measurer);
    [].forEach.call(measurer.getElementsByClassName(itemClass), (item) => {
        const styles = window.getComputedStyle(item);
        itemsSizes.push(item.clientWidth +
            (considerMargins ? parseFloat(styles.marginLeft) + parseFloat(styles.marginRight) : 0));
    });
    document.body.removeChild(measurer);
    return itemsSizes;
}

/**
 * Вычисляет горизонтальный размер ещё не отрисованного HTML блока с css классом
 * @param blockClass CSS класс элемента который необходимо измерить до отрисовки
 */
export function getWidthForCssClass(blockClass: string): number {
    const measurer: HTMLElement = document.createElement('div');
    measurer.classList.add(blockClass);
    return getWidth(measurer);
}
