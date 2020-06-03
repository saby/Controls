import merge = require('Core/core-merge');
import {Stack as StackOpener} from 'Controls/popup';

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
    if (!self._openingSelector) {
        let
            selectorTemplate = self._options.selectorTemplate,
            defaultPopupOptions: PopupOptions = merge({
                id: self._popupId,
                opener: self,
                template: self._options.selectorTemplate.templateName,
                closeOnOutsideClick: true,
                isCompoundTemplate: self._options.isCompoundTemplate,
                eventHandlers: {
                    onOpen: () => {
                        self._openingSelector = null;
                    },
                    onResult: (result) => {
                        self._selectCallback(null, result);
                    },
                    onClose: () => {
                        self._openingSelector = null;
                        self._closeHandler();
                    }
                }
            }, selectorTemplate && selectorTemplate.popupOptions || {});

        if (popupOptions && popupOptions.template || selectorTemplate) {
            defaultPopupOptions.templateOptions = merge({
                selectedItems: self._getItems().clone(),
                multiSelect: multiSelect,
                handlers: {
                    onSelectComplete: function (event, result) {
                        StackOpener.closePopup(self._popupId);
                        if (self._options.isCompoundTemplate) {
                            self._selectCallback(null, result);
                        }
                    }
                }
            }, selectorTemplate.templateOptions || {});

            self._openingSelector = StackOpener.openPopup(merge(defaultPopupOptions, popupOptions || {})).then((id) => {
                self._popupId = id;
            });
        }
        return self._openingSelector;
    }
}
