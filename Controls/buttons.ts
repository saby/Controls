/**
 * Библиотека контролов, отвечающих за отображение разных вариантов кнопок. Также библиотека содержит публичные интерфейсы, необходимые для работы кнопок.
 * @library
 * @author Красильников А.С.
 */

import * as ButtonTemplate from 'wml!Controls/_buttons/ButtonBase';

export {default as Button, simpleCssStyleGeneration, IViewMode, defaultHeight, defaultFontColorStyle, getDefaultOptions} from './_buttons/Button';
export {default as ArrowButton, IArrowButtonOptions} from './_buttons/ArrowButton';
export {default as ActualApi} from './_buttons/ActualApi';
export {IClick as IClick} from './_buttons/interface/IClick';
export {IButton as IButton} from './_buttons/interface/IButton';
export {IButtonOptions as IButtonOptions} from './_buttons/interface/IButton';
export {ButtonTemplate};
