import Deferred = require('Core/Deferred');
import moduleStubs = require('Core/moduleStubs');
import isNewEnvironment = require('Core/helpers/isNewEnvironment');
import {Logger} from 'UI/Utils';

var _private = {
   prepareDeps: function(config) {
      var dependencies = ['Controls/popup'];
      if (config.isStack === true) {
         dependencies.push('Controls/popupTemplate');
         config._path = 'StackController';
         config._type = 'stack';
      } else if (config.target) {
         dependencies.push('Controls/popupTemplate');
         config._path = 'StickyController';
         config._type = 'sticky';
      } else {
         dependencies.push('Controls/popupTemplate');
         config._path = 'DialogController';
         config._type = 'dialog';
      }
      // В номенклатуре написали свою recordFloatArea, отнаследовавшись от платформенной.
      // В слое совместимости нам как-то нужно понимать, какое окно сейчас хотят открыть, чтобы грузить нужные зависимости
      // Договорились понимать по опции _mode
      config._popupComponent = config._mode || 'floatArea';
      dependencies.push(config.template);
      return dependencies;
   }
};

var DialogHelper = {
   open: function(path, config) {
      var result = moduleStubs.requireModule(path).addCallback(function(Component) {
         if (isNewEnvironment()) {
            var dfr = new Deferred();
            var deps = _private.prepareDeps(config);
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'], function(CompatiblePopup) {
               CompatiblePopup.load().addCallback(function() {
                  require(deps, function(popup, Strategy) {
                     var CoreTemplate = require(config.template);
                     config._initCompoundArea = function(compoundArea) {
                        dfr && dfr.callback(compoundArea);
                        dfr = null;
                     };
                     popup.BaseOpener.showDialog(
                        CoreTemplate, config, config._path ? Strategy[config._path] : Strategy
                     );
                  }, function(err) {
                     Logger.error(`Не удалось загрузить модули для открытия окна: ${err.requireModules.join(',')}`);
                  });
               });
            });
            return dfr;
         }
         return new Component[0](config);
      });
      return result;
   }
};
DialogHelper._private = _private;

export default DialogHelper;
