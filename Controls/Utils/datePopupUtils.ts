export default {
    getCommonOptions: function (self) {
        return {
            opener: self,
            direction: {horizontal: 'right'},
            targetPoint: { horizontal: 'left' },
            fittingMode: 'overflow',
            eventHandlers: {
                onResult: self._onResult.bind(self)
            }
        };
    },

    getTemplateOptions: function(self) {
        return {
            ...this.getCommonTemplateOptions(self),
            startValue: self._options.value,
            endValue: self._options.value
        };
    },

    getDateRangeTemplateOptions: function(self) {
        return {
            ...this.getCommonTemplateOptions(self),
            startValue: self._rangeModel?.startValue || self._options.startValue,
            endValue: self._rangeModel?.endValue || self._options.endValue,
            startValueValidators: self._options.startValueValidators,
            endValueValidators: self._options.endValueValidators
        };
    },

    getCommonTemplateOptions: function(self) {
        return {
            mask: self._options.mask,
            readOnly: self._options.readOnly,
            dateConstructor: self._options.dateConstructor
        };
    }
};
