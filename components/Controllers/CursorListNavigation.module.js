define('js!SBIS3.CONTROLS.CursorListNavigation',
   [
      'Core/Abstract',
      'js!SBIS3.CONTROLS.IListNavigation'
   ],
   function (Abstract, IListNavigation) {
      /**
       * Контроллер, позволяющий связывать компоненты осуществляя базовое взаимодейтсие между ними
       * @author Крайнов Дмитрий
       * @class SBIS3.CONTROLS.CursorListNavigation
       * @extends Core/Abstract
       * @mixes SBIS3.CONTROLS.IListNavigation
       * @public
       */
      var CursorListNavigation = Abstract.extend([IListNavigation],/**@lends SBIS3.CONTROLS.CursorListNavigation.prototype*/{
         prepareQueryParams: function(projection, direction) {
            var edgeRecord, filterValue, additionalFilter = {};
            if (direction == 'up') {
               edgeRecord = projection.at(0).getContents();
               filterValue = edgeRecord.get(this._options.config.field);
               additionalFilter[this._options.config.field+'<='] = filterValue;
            }
            else if (direction == 'down') {
               edgeRecord = projection.at(projection.getCount() - 1).getContents();
               filterValue = edgeRecord.get(this._options.config.field);
               additionalFilter[this._options.config.field+'>='] = filterValue;
            }
            return {
               filter : additionalFilter
            }
         },

         analizeResponceParams: function(dataset) {

         }

      });

      return CursorListNavigation;
   });
