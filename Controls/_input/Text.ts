import Base = require('Controls/_input/Base');
import entity = require('Types/entity');
import ViewModel from 'Controls/_input/Text/ViewModel';
import {Logger} from 'UI/Utils';

/**
 * Однострочное поле ввода текста.
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/text/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Text
 * @extends Controls/input:Base
 *
 * @mixes Controls/input:IText
 *
 * @public
 * @demo Controls-demo/Input/Text/Base/Index
 *
 * @author Красильников А.С.
 */

var _private = {
    validateConstraint: function (constraint) {
        if (constraint && !/^\[[\s\S]+?\]$/.test(constraint)) {
            Logger.error('Controls/_input/Text', 'The constraint options are not set correctly. More on https://wi.sbis.ru/docs/js/Controls/_input/Text/options/constraint/');
            return false;
        }

        return true;
    }
};

var Text = Base.extend({
    _defaultValue: '',
    _punycodeToUnicode: null,

    _getViewModelOptions: function (options) {
        return {
            maxLength: options.maxLength,
            constraint: options.constraint,
            punycodeToUnicode: this._punycodeToUnicode
        };
    },

    _getViewModelConstructor: function () {
        return ViewModel;
    },

    _notifyInputCompleted: function () {
        if (this._options.trim) {
            var trimmedValue = this._viewModel.displayValue.trim();

            if (trimmedValue !== this._viewModel.displayValue) {
                this._viewModel.displayValue = trimmedValue;
                this._notifyValueChanged();
            }
        }

        Text.superclass._notifyInputCompleted.apply(this, arguments);
    },

    _syncBeforeMount: function(options): void {
        Text.superclass._beforeMount.call(this, options);

        _private.validateConstraint(options.constraint);
    },

    _beforeMount: function (options) {
        if (options.convertPunycode) {
            return this._loadConverterPunycode().then(() => {
                this._syncBeforeMount(options);
            });
        }

        this._syncBeforeMount(options);
    },

    _beforeUpdate: function (newOptions) {
        Text.superclass._beforeUpdate.apply(this, arguments);

        if (this._options.constraint !== newOptions.constraint) {
            _private.validateConstraint(newOptions.constraint);
        }
    },

    _loadConverterPunycode: function (): Promise<void> {
        return new Promise((resolve) => {
            require(['/cdn/Punycode/1.0.0/punycode.js'],
                () => {
                    this._punycodeToUnicode = Punycode.toUnicode;
                    resolve();
                },
                resolve
            );
        });
    }
});

Text.getDefaultOptions = function () {
    var defaultOptions = Base.getDefaultOptions();

    defaultOptions.trim = false;
    defaultOptions.convertPunycode = false;

    return defaultOptions;
};

Text.getOptionTypes = function () {
    var optionTypes = Base.getOptionTypes();

    optionTypes.maxLength = entity.descriptor(Number, null);
    optionTypes.trim = entity.descriptor(Boolean);
    optionTypes.constraint = entity.descriptor(String);

    return optionTypes;
};

export = Text;
