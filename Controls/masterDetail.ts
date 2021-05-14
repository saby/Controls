/**
 * Библиотека контролов для организации двухколоночных списков, в которых выбор элемента из первой колонки влияет на содержимое второй колонки.
 * @library Controls/masterDetail
 * @includes Base Controls/_masterDetail/Base
 * @includes List Controls/_masterDetail/List
 * @public
 * @author Авраменко А.С.
 */

/*
 * masterDetail library
 * @library Controls/masterDetail
 * @includes Base Controls/_masterDetail/Base
 * @includes List Controls/_masterDetail/List
 * @public
 * @author Авраменко А.С.
 */

import Base = require('wml!Controls/_masterDetail/WrappedBase');
export {
    Base
};
export {default as List} from 'Controls/_masterDetail/List';
