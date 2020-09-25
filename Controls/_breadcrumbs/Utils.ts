import {ItemsUtil} from 'Controls/list';
import {Record} from 'Types/entity';
import {getFontWidth} from 'Controls/Utils/getFontWidth';
import {IMultilinePathOptions} from './MultilinePath';
import {IBreadCrumbsOptions} from './interface/IBreadCrumbs';

//TODO удалить, когда появится возможность находить значение ширины иконок и отступов.
const ARROW_WIDTH = 16;
const PADDING_RIGHT = 2;

export default {
    shouldRedraw(currentItems: Record[], newItems: Record[]): boolean {
        return currentItems !== newItems;
    },
    getItemData(index: number, items: Record[], arrow: boolean = false, withOverflow: boolean = false): object {
        const currentItem = items[index];
        const count = items.length;
        return {
            getPropValue: ItemsUtil.getPropertyValue,
            item: currentItem,
            hasArrow: count > 1 && index !== 0 || arrow,
            withOverflow
        };
    },
    drawBreadCrumbsItems(items: Record[], arrow: boolean = false): any[] {
        return items.map((item, index, items) => {
            return this.getItemData(index, items, arrow);
        });
    },
    canShrink(minWidth: number, currentWidth: number, availableWidth: number): boolean {
        return currentWidth - minWidth < availableWidth;
    },
    getTextWidth(text: string, size: string  = 'xs'): number {
        return getFontWidth(text, size);
    },
    getItemsWidth(items: Record[], options: IMultilinePathOptions, getTextWidth: Function = this.getTextWidth): number[] {
        const itemsWidth = [];
        items.forEach((item, index) => {
            const itemTitleWidth = getTextWidth(ItemsUtil.getPropertyValue(item, options.displayProperty), options.fontSize);
            const itemWidth = index !== 0 ? itemTitleWidth + ARROW_WIDTH : itemTitleWidth;
            itemsWidth.push(itemWidth + PADDING_RIGHT);
        });
        return itemsWidth;
    },
    calculateItemsWithShrinkingLast(items: Record[], options: IMultilinePathOptions, width: number, getTextWidth: Function = this.getTextWidth): {visibleItems: Record[], indexEdge: number} {
        // придумать, чтобы два раза не проходился в крошках в две строки
        const itemsWidth = this.getItemsWidth(items, options, getTextWidth);
        let indexEdge = 0;
        let visibleItems;
        let firstContainerItems = [];
        if (items.length <= 2) {
            // Если крошек меньше двух, располагаем их в первом контейнере
            firstContainerItems = items.map((item, index, items) => {
                const withOverflow = items[index].get(options.displayProperty).length > 3;
                return this.getItemData(index, items, false, withOverflow);
            });
            return {
                visibleItems: firstContainerItems,
                indexEdge: items.length
            };
        } else {
            // Если крошки занимают меньше доступной ширины, начинам расчеты
            let firstContainerWidth = 0;
            // заполняем в первый контейнер то, что помещается. Запоминаем индекс последней крошки
            while (firstContainerWidth < width && indexEdge < items.length) {
                firstContainerWidth += itemsWidth[indexEdge];
                indexEdge++;
            }
            indexEdge -= 1;
            for (let i = 0; i < indexEdge; i++) {
                firstContainerItems.push(items[i]);
            }
            // позволяем сокращаться последней папке в первом контейнере
            const minWidthOfLastItem = this.getMinWidth(items, options, indexEdge, getTextWidth);
            if (firstContainerWidth - itemsWidth[indexEdge] + minWidthOfLastItem <= width) {
                firstContainerItems.push(items[indexEdge]);
                indexEdge++;
            }
            visibleItems = this.drawBreadCrumbsItems(firstContainerItems);
            visibleItems[visibleItems.length - 1].withOverflow = true;
            return {
                visibleItems,
                indexEdge
            };
        }
    },
    getMinWidth(items: Record[], options: IBreadCrumbsOptions, index: number, getTextWidth: Function): number {
        const text = items[index].get(options.displayProperty);
        let textWidth = getTextWidth(text.substring(0, 3) + '...', options.fontSize) + PADDING_RIGHT;
        textWidth = index === 0 ? textWidth : textWidth + ARROW_WIDTH;
        return textWidth;
    },
    calculateItemsWithDots(items: Record[], options: IBreadCrumbsOptions, indexEdge: number, width: number, dotsWidth: number, getTextWidth: Function = this.getTextWidth): Record[] {
        let secondContainerWidth = 0;
        let shrinkItemIndex;
        const itemsWidth = this.getItemsWidth(items, options, getTextWidth);
        for (let i = indexEdge; i < items.length; i++) {
            secondContainerWidth += itemsWidth[i];
        }
        // Сначала пробуем замылить предпоследнюю крошку
        secondContainerWidth -= itemsWidth[items.length - 2];
        const minWidthOfPenultimateItem = items.length > 2 ? this.getMinWidth(items, options, items.length - 2, getTextWidth) : undefined;
        secondContainerWidth += minWidthOfPenultimateItem;
        // если второй контейнер по ширине больше, чем доступная ширина, начинаем расчеты
        if (secondContainerWidth > width && items.length > 2) {
            // предпоследняя не уместилась - сразу вычитаем ее мин.ширину
            secondContainerWidth -= minWidthOfPenultimateItem;
            const secondContainerItems = [];
            // если замылить не получилось - показываем точки
            secondContainerWidth += dotsWidth;
            let index;
            let currentMinWidth;
            // предпоследняя не поместилась - начинаем с пред-предпоследней и так далее
            for (index = items.length - 3; index >= indexEdge; index--) {
                currentMinWidth = this.getMinWidth(items, options, index, getTextWidth);
                if (secondContainerWidth <= width) {
                    break;
                } else if (this.canShrink(currentMinWidth, secondContainerWidth, width)) {
                    shrinkItemIndex = index;
                    secondContainerWidth -= itemsWidth[index] - currentMinWidth;
                    break;
                } else {
                    secondContainerWidth -= itemsWidth[index];
                }
            }
            index = index === -1 && indexEdge === 0 ? 0 : index;
            // заполняем крошками, которые влезли, второй контейнер (не считая последней)
            for (let j = indexEdge; j <= index; j++) {
                secondContainerItems.push(this.getItemData(j, items, true, j === index && items[j].get(options.displayProperty).length > 3));
            }
            // добавляем точки
            const dotsItem = {};
            dotsItem[options.displayProperty] = '...';

            secondContainerItems.push({
                getPropValue: ItemsUtil.getPropertyValue,
                item: dotsItem,
                isDots: true,
                hasArrow: true
            });
            // добавляем последнюю папку
            secondContainerItems.push(this.getItemData(items.length - 1, items, true, false));

            return secondContainerItems;

        } else {
            // если все остальные крошки поместились - пушим по второй контейнер
            const secondContainerItems = [];
            for (let j = indexEdge; j < items.length; j++) {
                secondContainerItems.push(this.getItemData(j, items, true, j === items.length - 2 && items[items.length - 2].get(options.displayProperty).length > 3));
            }
            if (secondContainerItems.length === 2) {
                secondContainerItems[1].withOverflow = true;
            }
            return secondContainerItems;
        }
    }

};
