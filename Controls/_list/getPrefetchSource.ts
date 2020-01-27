import {Controller} from 'Controls/source';
import {PrefetchProxy} from 'Types/source';

function load(sourceOptions, data) {
   if (data) {
      return Promise.resolve(data);
   }

   var sourceController = new Controller({
      source: sourceOptions.source,
      navigation: sourceOptions.navigation,
      idProperty: sourceOptions.keyProperty
   });

   return sourceController.load(sourceOptions.filter, sourceOptions.sorting);
}

function getThenFunction(sourceOptions) {
   return function(result) {
      var error;
      var data;

      if (result instanceof Error) {
         error = result;
         data = undefined;
      } else {
         error = undefined;
         data = result;
      }

      return {
         source: new PrefetchProxy({
            target: getSource(sourceOptions),
            data: {
               query: error || data
            }
         }),
         data: data,
         error: error
      };
   };
}

function getSource(sourceOptions) {
   return sourceOptions.source instanceof PrefetchProxy ? sourceOptions.source.getOriginal() : sourceOptions.source;
}

export default function(sourceOptions, data) {
   var thenFunction = getThenFunction(sourceOptions);
   return load(sourceOptions, data).then(thenFunction, thenFunction);
}
