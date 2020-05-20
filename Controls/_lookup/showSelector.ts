import merge = require('Core/core-merge');

interface PopupOptions {
    opener: any;
    isCompoundTemplate: boolean;
    templateOptions: any;
}

/**
 * Open selector
 * @param {Controls/_lookup/BaseController} self
 * @param {Object} popupOptions
 * @param {Boolean} multiSelect
 * @returns {Promise}
 */
export default function(self, popupOptions, multiSelect) {
    let
        selectorOpener = self._children.selectorOpener,
        selectorTemplate = self._options.selectorTemplate,
        defaultPopupOptions: PopupOptions = merge({
            opener: self,
            template: selectorTemplate.templateName,
            closeOnOutsideClick: true,
            isCompoundTemplate: self._options.isCompoundTemplate
        }, selectorTemplate && selectorTemplate.popupOptions || {});

    if (popupOptions && popupOptions.template || selectorTemplate) {
        defaultPopupOptions.templateOptions = merge({
            selectedItems: self._getItems().clone(),
            multiSelect: multiSelect,
            handlers: {
                onSelectComplete: function (event, result) {
                    selectorOpener.close();
                    if (self._options.isCompoundTemplate) {
                        self._selectCallback(null, result);
                    }
                }
            }
        }, selectorTemplate.templateOptions || {});

        return selectorOpener.open(merge(defaultPopupOptions, popupOptions || {}));
    }
}
