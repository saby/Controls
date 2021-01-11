import {Control} from 'UI/Base';

/**
 * Executes callback immediately after the next update.
 */
export default function scheduleCallbackAfterRedraw(
   instance: Control,
   callback: () => void
) {
   /**
    * Sometimes we want to do something only after component was updated with some state.
    * Because state is stored on instance it is shared in all methods, so we can't simply check state in _afterUpdate, because there is no guarantee it's the right update.
    * To avoid race conditions, we have to make sure that _beforeUpdate gets executed before callback gets called in _afterUpdate.
    */
   let hasUpdated = false;
   let oldBU = instance._beforeUpdate;
   let oldAU = instance._afterUpdate;

   instance._beforeUpdate = function() {
      oldBU && oldBU.apply(instance, arguments);
      instance._beforeUpdate = oldBU;
      oldBU = null;
      hasUpdated = true;
   };

   instance._afterUpdate = function() {
      oldAU && oldAU.apply(instance, arguments);
      if (hasUpdated) {
         instance._afterUpdate = oldAU;
         oldAU = null;
         callback();
      }
   };
}