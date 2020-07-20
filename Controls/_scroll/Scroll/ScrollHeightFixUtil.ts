import {detection} from 'Env/Env';

      var _private = {

         /**
          * Расчитать функцию расчета значения для css свойства overflow.
          * @param container
          * @return {boolean}
          */
         calcHeightFixFn: function(container) {

            if (detection.firefox) {
               if (window && container) {
                  /**
                   * В firefox при высоте дочерних элементав < высоты скролла(34px) и резиновой высоте контейнера
                   * через max-height, нативный скролл не пропадает.
                   * В такой ситуации content имеет высоту скролла, а должен быть равен высоте дочерних элементов.
                   */
                  return container.scrollHeight === container.offsetHeight && container.scrollHeight < 35;
               }
            } else {
               return false;
            }
         }
      };

      export = {
         _private: _private,

         calcHeightFix: _private.calcHeightFixFn
      };
