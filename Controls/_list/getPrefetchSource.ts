import {CrudWrapper} from 'Controls/dataSource';
import {PrefetchProxy} from 'Types/source';
import {NavigationController} from 'Controls/source';
import {IAdditionalQueryParams} from 'Controls/_interface/IAdditionalQueryParams';

function load(sourceOptions, data) {
   if (data) {
      return Promise.resolve(data);
   }

   const crudWrapper = new CrudWrapper({
      source: sourceOptions.source
   });

   let params = {filter: sourceOptions.filter, sorting: sourceOptions.sorting} as IAdditionalQueryParams;
   if (sourceOptions.navigation) {
      const navigationController = new NavigationController({
         navigationType: sourceOptions.navigation.source,
         navigationConfig: sourceOptions.navigation.sourceConfig
      });
      params = navigationController.getQueryParams({filter: params.filter, sorting: params.sorting});
   }

   return crudWrapper.query(params, sourceOptions.keyProperty);
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

export default function(sourceOptions, data?) {
   var thenFunction = getThenFunction(sourceOptions);
   return load(sourceOptions, data).then(thenFunction, thenFunction);
}
