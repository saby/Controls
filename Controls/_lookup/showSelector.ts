import merge = require('Core/core-merge');
import {DialogOpener, IDialogPopupOptions, StackOpener, IStackPopupOptions} from 'Controls/popup';

function getPopupOptions(self): IStackPopupOptions | IDialogPopupOptions {
    const selectorTemplate = self._options.selectorTemplate;

    return {
        opener: self,
        template: selectorTemplate && selectorTemplate.templateName,
        closeOnOutsideClick: true,
        isCompoundTemplate: self._options.isCompoundTemplate,
        eventHandlers: {
            onResult: (result) => {
                self._selectCallback(null, result);
            },
            onClose: () => {
                self._closeHandler();
                self._notify('selectorClose');
            }
        }
    };
}

function getTemplateOptions(self, multiSelect) {
    return {
        selectedItems: self._lookupController.getItems().clone(),
        multiSelect: multiSelect,
        handlers: {
            onSelectComplete: function (event, result) {
                self._opener.close();
                if (self._options.isCompoundTemplate) {
                    self._selectCallback(null, result);
                }
            }
        }
    };
}

/**
 * Open selector
 * @param {Controls/_lookup/BaseController} self
 * @param {Object} popupOptions
 * @param {Boolean} multiSelect
 * @returns {Promise}
 */
export default function(self, popupOptions, multiSelect) {
    const selectorTemplate = self._options.selectorTemplate;
    const selectorMode = selectorTemplate?.mode;
    const stackPopupOptions = getPopupOptions(self);

    if (!self._opener) {
        self._opener = selectorMode === 'dialog' ? new DialogOpener() : new StackOpener();
    }

    if (selectorTemplate && selectorTemplate.popupOptions) {
        merge(stackPopupOptions, selectorTemplate.popupOptions);
    }

    if (popupOptions && popupOptions.template || selectorTemplate) {
        stackPopupOptions.templateOptions = getTemplateOptions(self, multiSelect);
        if (selectorTemplate && selectorTemplate.templateOptions) {
            merge(stackPopupOptions.templateOptions, selectorTemplate.templateOptions);
        }

        if (popupOptions) {
            merge(stackPopupOptions, popupOptions);
        }
        self._opener.open(stackPopupOptions);
        return true;
    }
    return false;
}
