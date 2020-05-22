import Control = require('Core/Control');
import {descriptor} from 'Types/entity';
import template = require('wml!Controls/_dateRange/RelationButton/RelationButton');

/**
 * Кнопка для связывания периодов. Контрол, который может использоваться с {@link Controls/_dateRange/RelationController RelationController}.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less">переменные тем оформления</a> 
 *
 * @class Controls/_dateRange/RelationButton
 * @extends Core/Control
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/RelationController
 *
 */

/*
 * Button for linking periods. The control that can be used with {@link Controls/_dateRange/RelationController RelationController}.
 *
 * @class Controls/_dateRange/RelationButton
 * @extends Core/Control
 *
 * @control
 * @public
 * @category Input
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/RelationController
 *
 */

const valueMap = {
    normal: 'byCapacity',
    byCapacity: 'normal'
};

const Component = Control.extend({
    _template: template,

    _valueChanged: function (event) {
        event.stopImmediatePropagation();
        this._notify('valueChanged', [valueMap[this._options.value]]);
        this._notify('relationButtonBindTypeChanged', [valueMap[this._options.value]], { bubbling: true });
    }
});

Component.getOptionTypes = function () {
    return {
        value: descriptor(String).oneOf([
            'normal',
            'byCapacity'
        ])
    };
};

Component.getDefaultOptions = function () {
    return {
        value: 'normal'
    };
};
Component._theme = ['Controls/dateRange'];
export default Component;
