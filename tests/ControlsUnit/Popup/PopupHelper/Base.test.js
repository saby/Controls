define(
   [
      'Controls/_popup/PopupHelper/Base'
   ],
   (Base) => {
      'use strict';
      const BaseOpener = Base.default;

      describe('Controls/_popup/PopupHelper/Base', () => {
         it('opener class options', () => {
            let opener = new BaseOpener({
               template: 'someTplString',
               modal: true,
               templateOptions: {
                  someOption: 'value'
               }
            });
            opener._openPopup = function(popupOptions) {
               assert.equal(popupOptions.modal, false);
               assert.equal(popupOptions.template, 'someTplString');
               assert.equal(popupOptions.templateOptions.someOption, 'value');
               assert.equal(popupOptions.templateOptions.someOption2, 'value2');
            };
            opener.open({
               modal: false,
               templateOptions: {
                  someOption2: 'value2'
               }
            });
         });
      });
   }
);
