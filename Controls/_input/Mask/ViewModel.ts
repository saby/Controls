import {FormatBuilder, Formatter} from 'Controls/decorator';
import InputProcessor = require('Controls/_input/Mask/InputProcessor');
import BaseViewModel = require('Controls/_input/Base/ViewModel');



      /**
       * @class Controls/_input/Text/ViewModel
       * @private
       * @author Красильников А.С.
       */
      var _private = {
         updateFormatMaskChars: function(self, formatMaskChars) {
            if (self._formatMaskChars === formatMaskChars) {
               return;
            }
            self._formatMaskChars = formatMaskChars;
            self._nextVersion();
            self.formatMaskCharsRegExp = new RegExp('[' + Object.keys(formatMaskChars).join('') + ']', 'g');
         },

         prepareSplitValue: function(result) {
            var position = result.position;
            var before = result.value.substring(0, position);
            var after = result.value.substring(position, result.value.length);

            return {
               before: before,
               after: after,
               insert: '',
               delete: ''
            };
         },
      };

      class ViewModel extends BaseViewModel {
         constructor(...args: any[]) {
            super(...args);
            this.setCarriageDefaultPosition(0);
         }

         _convertToValue(displayValue) {
            this._format = FormatBuilder.getFormat(this.options.mask, this.options.formatMaskChars, this.options.replacer);
            const value = Formatter.getClearData(this._format, displayValue).value;
            return value;
         }
         _convertToDisplayValue(value) {
            this._format = FormatBuilder.getFormat(this.options.mask, this.options.formatMaskChars, this.options.replacer);
            this._nextVersion();
            const fValue = value === null ? '' : value;
            _private.updateFormatMaskChars(this, this.options.formatMaskChars);
            try {
               const fDate = Formatter.getFormatterData(this._format, { value: fValue, position: 0 });
               return fDate.value;
            } catch (e) {
               if (this.options.replacer) {
                  return this._options.mask.replace(this.formatMaskCharsRegExp, this.options.replacer);
               }
               return '';
            }
         }
         handleInput(splitValue, inputType) {
            this._format = FormatBuilder.getFormat(this.options.mask, this.options.formatMaskChars, this.options.replacer);
            this._nextVersion();
            _private.updateFormatMaskChars(this, this.options.formatMaskChars);
            const result = InputProcessor.input(splitValue, inputType, this.options.replacer, this._format, this._format);
            return super.handleInput.call(this, _private.prepareSplitValue(result));
         }

         setCarriageDefaultPosition(currentPosition?: number) {
             let selection = this._getCarriageDefaultPosition(currentPosition);
             if (selection !== currentPosition || selection !== this.selection.start) {
                this.selection = selection;
                this._nextVersion();
                this._shouldBeChanged = true;
             }
         }

         private _getCarriageDefaultPosition(currentPosition?: number): number {
            let
               position,
               isFiled;

            if (this.options.replacer) {
               position = this.displayValue.indexOf(this.options.replacer);
               isFiled = position === -1;
               if (currentPosition === undefined) {
                  currentPosition = isFiled ? 0 : position;
               }
               return isFiled ? currentPosition : Math.min(currentPosition, position);
            }
            return currentPosition === undefined ? this.displayValue.length : currentPosition;
         }
      }

export = ViewModel;
