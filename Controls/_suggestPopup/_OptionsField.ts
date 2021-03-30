/**
 * Context field for Suggest options
 */
import DataContext = require('Core/DataContext');

export default class OptionsField extends DataContext {
   _moduleName: string;
   options: object;

   constructor(options: object) {
      super();
      this.options = options;
   }

   setOptions(newOptions: object): void {
      this.options = {
         ...this.options,
         ...newOptions
      };
      // Core/DataContext написан на js, в итоге с него не цепляются типы
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this._nextVersion();
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this.updateConsumers();
   }
}

OptionsField.prototype._moduleName = 'Controls/_suggestPopup/_OptionsField';
