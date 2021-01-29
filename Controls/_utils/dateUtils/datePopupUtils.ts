import {Control, IControlOptions} from 'UI/Base';

export function getCommonOptions(self: Control<IControlOptions, unknown>): object {
    return {
        opener: self,
        direction: {horizontal: 'right'},
        targetPoint: {horizontal: 'left'},
        fittingMode: 'overflow',
        eventHandlers: {
            onResult: self._onResult.bind(self)
        }
    };
}

export function getTemplateOptions(self: Control<IControlOptions, unknown>): object {
    return {
        ...this.getCommonTemplateOptions(self),
        startValue: self.rangeModel?.startValue || self._startValue || self._options.value,
        endValue: self.rangeModel?.endValue || self._endValue || self._options.value
    };
}

export function getDateRangeTemplateOptions(self: Control<IControlOptions, unknown>): object {
    return {
        ...this.getCommonTemplateOptions(self),
        startValue: self._rangeModel?.startValue || self._startValue,
        endValue: self._rangeModel?.endValue || self._endValue,
        startValueValidators: self._options.startValueValidators,
        endValueValidators: self._options.endValueValidators
    };
}

export function getCommonTemplateOptions(self: Control<IControlOptions, unknown>): object {
    return {
        mask: self._options.mask,
        readOnly: self._options.readOnly,
        dateConstructor: self._options.dateConstructor
    };
}
