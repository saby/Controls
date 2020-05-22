import Control = require('Core/Control');
import Model from './RelationController/Model';
import template = require('wml!Controls/_dateRange/RelationController/RelationController');
import {Date as WSDate} from 'Types/entity';

/**
 * Контроллер, который позволяет связать несколько контролов для ввода периода.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dateRange.less">переменные тем оформления</a> 
 *
 * @class Controls/_dateRange/RelationController
 * @extends Core/Control
 *
 * @control
 * @public
 * @demo Controls-demo/dateRange/RelationController
 * @author Красильников А.С.
 */

/*
 * Controller allows you to link several controls for entering periods.
 *
 * @class Controls/_dateRange/RelationController
 * @extends Core/Control
 *
 * @control
 * @public
 * @demo Controls-demo/dateRange/RelationController
 * @author Красильников А.С.
 */

/**
 * @name Controls/_dateRange/RelationController#startValue0
 * @cfg {Date} Начальное значение первого периода.
 * @remark
 * Вы можете привязать параметры startValue0, startValue1, startValue2 в количестве, равном количеству контролов, которые необходимо связать.
 * @example
 * В этом примере показано, как связать 2 диапазона контролов ввода.
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/*
 * @name Controls/_dateRange/RelationController#startValue0
 * @cfg {Date} Start value of the first period.
 * @remark
 * You can bind the options startValue0, startValue1, startValue2 in an amount equal to the number of controls you need to associate.
 * @example
 * This example shows how to bind 2 range input controls.
 * <pre>
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/**
 * @name Controls/_dateRange/RelationController#endValue0
 * @cfg {Date} Конечное значение первого периода.
 * @remark
 * Вы можете привязать параметры endValue0, endValue1, endValue2 в количестве, равном количеству контролов, которые необходимо связать.
 * @example
 * В этом примере показано, как связать 2 диапазона контролов ввода.
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/*
 * @name Controls/_dateRange/RelationController#endValue0
 * @cfg {Date} End value of the first period.
 * @remark
 * You can bind the options endValue0, endValue1, endValue2 in an amount equal to the number of controls you need to associate.
 * @example
 * This example shows how to bind 2 range input controls.
 * <pre>
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/**
 * @typedef {String} BindType
 * @variant normal В этом режиме изменение одного периода всегда приводит к пересчету остальных периодов.
 * @variant byCapacity В этом режиме при изменении одного из периодов другие изменяются только в том случае, если изменился тип периода.
 */

/*
 * @typedef {String} BindType
 * @variant normal In this mode, changing one period always results to recalculation of the remaining periods.
 * @variant byCapacity In this mode, when one of the periods changes, the others change only if the type of the period has changed.
 */

/**
 * @name Controls/_dateRange/RelationController#bindType
 * @cfg {BindType} Тип привязки.
 * @default normal
 * @example
 * В этом примере показано, как задать тип привязки.
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController bindType="{{_bindType}}">
 *        <Controls.dateRange:RelationButton value="{{content.bindType}}"/>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       _bindType: 'normal'
 *    });
 * </pre>
 */

/*
 * @name Controls/_dateRange/RelationController#bindType
 * @cfg {BindType} Bind type
 * @default normal
 * @example
 * This example shows how to set the bind type.
 * <pre>
 *    <Controls.dateRange:RelationController bindType="{{_bindType}}">
 *        <Controls.dateRange:RelationButton value="{{content.bindType}}"/>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _bindType: 'normal'
 *    });
 * </pre>
 */

/**
 * @name Controls/_dateRange/RelationController#content
 * @cfg {Content} Содержимое контрола. Контроллер устанавливает периоды и тип параметров связи в шаблоне.
 * Шаблон может содержать контролы выбора периода.
 * Каждый контрол выбора периода должен быть обернут в {@link Controls/_dateRange/RelationWrapper}. Также шаблон может содержать {@link Controls/_dateRange/RelationButton}.
 * @example
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationButton value="{{content.bindType}}"/>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/*
 * @name Controls/_dateRange/RelationController#content
 * @cfg {Content} Control contents. The controller set the periods and type of relation options on the template.
 * An internal template can contain period selection controls. Each of the period selection control
 * must be wrapped in {@link Controls/_dateRange/RelationWrapper}. Also the template may contain a {@link Controls/_dateRange/RelationButton}.
 * @example
 * <pre>
 *    <Controls.dateRange:RelationController
 *            bind:startValue0="_startValue0"
 *             bind:endValue0="_endValue0"
 *             bind:startValue1="_startValue1"
 *             bind:endValue1="_endValue1">
 *        <Controls.dateRange:RelationWrapper number="{{0}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationWrapper number="{{1}}" ranges="{{content.ranges}}">
 *            <Controls.dateRange:LiteSelector/>
 *        </Controls.dateRange:RelationWrapper>
 *        <Controls.dateRange:RelationButton value="{{content.bindType}}"/>
 *    </Controls.dateRange:RelationController>
 * </pre>
 * <pre>
 *    Control.extend({
 *       _startValue0: new Date(2019, 0, 0),
 *       _endValue0: new Date(2019, 0, 31),
 *       _startValue1: new Date(2019, 1, 0),
 *       _endValue1: new Date(2019, 1, 31),
 *    });
 * </pre>
 */

/**
 * @event Происходит при изменении типа привязки.
 * @event Controls/_dateRange/RelationController#bindTypeChanged
 * @param {BindType} bindType Новое значение типа привязки.
 * @example
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController on:bindTypeChanged="_bindTypeChangedHandler()"/>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       ...
 *       _bindTypeChangedHandler(bindType) {
 *          if (bindType === 'normal') {
 *              this._buttonStyle = 'primary'
 *          } else if (bindType === 'byCapacity') {
 *              this._buttonStyle = 'default';
 *          }
 *       },
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Occurs when bind type was changed.
 * @name Controls/_dateRange/RelationController#bindTypeChanged
 * @param {BindType} bindType New bind type value.
 * @example
 * <pre>
 *    <Controls.dateRange:RelationController on:bindTypeChanged="_bindTypeChangedHandler()"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _bindTypeChangedHandler(bindType) {
 *          if (bindType === 'normal') {
 *              this._buttonStyle = 'primary'
 *          } else if (bindType === 'byCapacity') {
 *              this._buttonStyle = 'default';
 *          }
 *       },
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_dateRange/RelationController#periodsChanged Происходит при изменении хотя бы одного из периодов.
 * @param {Array} value Массив с периодами.
 * @example
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController on:periodsChanged="_periodsChangedHandler()"/>
 * </pre>
 * <pre class="brush: js">
 *    Control.extend({
 *       ...
 *       _periodsChangedHandler(periods) {
 *          this._saveToDatabase(periods);
 *       },
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_dateRange/RelationController#periodsChanged Occurs when at least one of the periods has changed.
 * @param {Array} value Array with periods.
 * @example
 * <pre>
 *    <Controls.dateRange:RelationController on:periodsChanged="_periodsChangedHandler()"/>
 * </pre>
 * <pre>
 *    Control.extend({
 *       ...
 *       _periodsChangedHandler(periods) {
 *          this._saveToDatabase(periods);
 *       },
 *       ...
 *    });
 * </pre>
 */

/**
 * Сдвигает периоды вперед.
 * @function
 * @name Controls/_dateRange/RelationController#shiftForward
 * @example
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController name="dateRelation"/>
 *    <Controls.buttons:Button on:click="dateRelation.shiftForward()"/>
 * </pre>
 * @see shiftBackward
 */

/*
 * Shifts periods forward
 * @function
 * @name Controls/_dateRange/RelationController#shiftForward
 * @example
 * <pre>
 *    <Controls.dateRange:RelationController name="dateRelation"/>
 *    <Controls.buttons:Button on:click="dateRelation.shiftForward()"/>
 * </pre>
 */

/**
 * Сдвигает периоды назад.
 * @function
 * @name Controls/_dateRange/RelationController#shiftBackward
 * @example
 * <pre class="brush: html">
 *    <Controls.dateRange:RelationController name="dateRelation"/>
 *    <Controls.buttons:Button on:click="dateRelation.shiftBackward()"/>
 * </pre>
 * @see shiftForward
 */

/*
 * Shifts periods backward
 * @function Controls/_dateRange/RelationController#shiftBackward
 * @example
 * <pre>
 *    <Controls.dateRange:RelationController name="dateRelation"/>
 *    <Controls.buttons:Button on:click="dateRelation.shiftBackward()"/>
 * </pre>
 */

var _private = {
    notifyRangeChanged: function(self, newRanges, ranges?) {
        let changed = false;
        for (let i in newRanges) {
            if (!ranges || ranges[i][0] !== newRanges[i][0]) {
                self._notify('startValue' + i + 'Changed', [newRanges[i][0]]);
                changed = true;
            }
            if (!ranges || ranges[i][1] !== newRanges[i][1]) {
                self._notify('endValue' + i + 'Changed', [newRanges[i][1]]);
                changed = true;
            }
        }
        if (changed) {
            self._notify('periodsChanged', [newRanges]);
        }
    }
};

var Component = Control.extend({
    _template: template,
    _model: null,

    _beforeMount: function (options) {
        this._model = new Model(options);
    },

    _beforeUpdate: function (options) {
        this._model.update(options);
    },

    _onRelationWrapperRangeChanged: function(event, start, end, controlNumber, bindType) {
        let ranges = this._model.ranges,
            oldBindType = this._model.bindType;
        this._model.updateRanges(start, end, controlNumber, bindType);
        _private.notifyRangeChanged(this, this._model.ranges, ranges);
        if (oldBindType !== this._model.bindType) {
            this._notify('bindTypeChanged', [this._model.bindType]);
        }
    },

    _onRelationButtonBindTypeChanged: function(event, bindType) {
        if (bindType !== this._model.bindType) {
            this._model.bindType = bindType;
            this._notify('bindTypeChanged', [this._model.bindType]);
        }
    },

    shiftForward: function() {
        this._model.shiftForward();
        _private.notifyRangeChanged(this, this._model.ranges);
    },

    shiftBackward: function() {
        this._model.shiftBackward();
        _private.notifyRangeChanged(this, this._model.ranges);
    },

    _beforeUnmount: function() {
        this._model = null;
    }
});

Component.getDefaultOptions = function () {
    return {
        bindType: 'normal',
        dateConstructor: WSDate
    };
};
//
// Component.getOptionTypes = function() {
//    return coreMerge({});
// };

export default Component;
