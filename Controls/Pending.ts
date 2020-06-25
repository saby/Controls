import Control = require('Core/Control');
import tmpl = require('wml!Controls/_Pending/Pending');
import PendingClass from 'Controls/_popup/Manager/PendingClass';

   /**
    * Контрол, отслеживающий выполнение необходимых действий, которые должны быть завершены до начала текущего действия.
    * Текущее действие запрашивает экземпляр класса Promise, который будет завершен после того, как завершатся все необходимые действия.
    * Например, всплывающее окно должно быть закрыто только после сохранения/не сохранения измененных данных, которые содержит это всплывающее окно.
    *
    * Pending - это зарегистрированное в текущем экземпляре класса Controls/Pending необходимое действие, которое должно завершиться до начала текущего действия.
    * Поэтому все пендинги должны быть завершены для разблокировки и запуска следующего действия.
    * @remark
    * Controls/Pending может запросить подтверждение перед закрытием вкладки/браузера, если пендинг зарегистрирован.
    * Controls/Pending имеет собственный LoadingIndicator, который может отображаться во время завершения пендинга. Этот {@link /docs/js/Controls/Container/LoadingIndicator/ LoadingIndicator} имеет параметры по умолчанию.
    * В момент, когда будет зарегистрирован первый пендинг с параметром showLoadingIndicator = true, LoadingIndicator отобразит индикатор.
    * В момент, когда последний пендинг с параметром showLoadingIndicator = true завершится, индикатор скроется.
    *
    * Controls/Pending обрабатывает 2 события: registerPending и cancelFinishingPending.
    *
    * registerPending - регистрация пендинга
    * registerPending имеет 2 аргумента: [promise, config].
    * promise - пендинг будет отменен, когда Promise будет завершен.
    * config - это объект с параметрами:
    *    - showLoadingIndicator (Boolean) - показывать индикатор загрузки или нет (во время регистрации пендинга)
    *    - onPendingFail (Function) - будет вызвана при попытке завершить пендинг (вызовы finishPendingOperations).
    *    Функция помогает завершить Promise. Пользователь должен завершить Promise (второй аргумент) в этой функции.
    *    Это может быть синхронное или асинхронное завершение.
    *
    * onPendingFail имеет 2 аргумента - [forceFinishValue, resultPromise].
    * forceFinishValue дает дополнительную информацию о завершении Promise.
    * resultPromise - Promise, по завершению которого завершается пендинг. Мы должны завершить его в функции onPendingFail.
    * forceFinishValue берется из аргумента finishPendingOperations (finishPendingOperations дает дополнительную информацию о завершении).
    * Пользователь может использовать этот аргумент в своей собственной функции onPendingFail.
    * Например, если в пендинге зарегистрирована измененная запись и нам нужно сохранить изменения, по умолчанию мы можем запросить подтверждение сохранения.
    * Но forceFinishValue может завершаться принудительно без подтверждения сохранения.
    *
    * cancelFinishingPending - отменяет Promise, который возвращен finishPendingOperations. Этот Promise никогда не завершится.
    * Полезно использовать, когда пендинг не может быть завершен сейчас, но будет завершен позднее другим способом.
    * Например, когда всплывающее окно ожидает завершения пендингов перед закрытием, но запись не может быть сохранена из-за ошибок валидации.
    * В этом случае, если мы не отменим Promise с помощью finishPendingOperations, всплывающеe окно будет закрыто позже, когда будут исправлены ошибки валидации.
    * Тогда окно закроется неожиданно для пользователя, который, возможно, не хотел его закрывать.
    *
    * @class Controls/Pending
    * @extends Core/Control
    * @control
    * @author Красильников А.С.
    * @public
    */

   /*
    * Controls/Pending is control (HOC) that helps to distribute order of action executions in the system.
    * Or, more specifically, it's controlling execution of necessary actions that must be complete before starting current action.
    * Current action requests Deferred instance that will be resolved when all necessary actions ends.
    * For example, popup must be closed only after resolving the question about saving of changed data containing this popup.
    *
    * Pending is registered necessary action that must ends before current action starts.
    * It would be some pendings registered in current Controls/Pending instance. Therefore, all of pendings must be ends
    * for unlock next action.
    * @remark
    * Controls/Pending is able to ask a confirmation question before closing of tab/browser if pending(s) is registered.
    * Controls/Pending has it's own LoadingIndicator that can shows while pending is resolving. This LoadingIndicator has default options.
    * In moment when first pending with option showLoadingIndicator = true will be registered LoadingIndicator shows indicator.
    * In moment when last pending with option showLoadingIndicator = true will be unregistered LoadingIndicator hides indicator.
    *
    * Controls/Pending is waiting 2 events: registerPending and cancelFinishingPending.
    *
    * registerPending - registrate the pending
    * registerPending has 2 arguments: [Promise, config].
    * dererred - pending will be unregistered when this Promise resolves
    * config is object having properties:
    *    - showLoadingIndicator (Boolean) - show loading indicator or not (during time while pending is registered)
    *    - onPendingFail (Function) - It will be called when trying to finish pendings (finishPendingOperations calls).
    *    function helps to resolve Promise of pending. User must resolve this Promise (second argument) in this function.
    *    It would be synchronous or asynchronous resolving.
    *
    * onPendingFail has 2 arguments - [forceFinishValue, resultPromise].
    * first argument (forceFinishValue) give additional information how to resolve Promise.
    * second argument is Promise value of pending. User must resolve this Promise in onPendingFail function.
    * forceFinishValue is taken from finishPendingOperations argument (finishPendingOperations defines additional information of resolving).
    * User can use this argument in it's own onPendingFail function or not.
    * For example, if pending registered by changed record and we need to save changes, by default we can ask a question about it.
    * But forceFinishValue can means forced answer and we can save (or not) record without asking a question.
    *
    * cancelFinishingPending - cancels Promise returned by finishPendingOperations. This Promise never resolve. It's need
    * to request new Promise by finishPendingOperations for setting callback on pendings finish.
    * It can be useful when pending can't be resolved now but will be resolve later another way.
    * For example, popup waiting finish of pendings before close, but record can not be saved because of validation errors.
    * In this case, if we don't cancel Promise by finishPendingOperations, popup will be closed later when validation errors
    * will be corrected. It will be unexpected closing of popup for user who maybe don't want to close popup anymore
    * in the light of developments.
    *
    * @class Controls/Pending
    * @extends Core/Control
    * @control
    * @author Красильников А.С.
    * @public
    */


   /**
    * @event pendingsFinished Событие произойдет в момент, когда в Controls/Pending не останется пендингов.
    * (после того, как последний пендинг завершится).
    * @param {SyntheticEvent} eventObject.
    */

   /*
    * @event pendingsFinished Event will be notified in moment when no more pendings in Controls/Pending
    * (after moment of last pending is resolving).
    * @param {SyntheticEvent} eventObject.
    */

   var module = Control.extend(/** @lends Controls/Container/PendingRegistrator.prototype */{
      _template: tmpl,
      _pendingController: null,
      _beforeMount: function() {
         if (typeof window !== 'undefined') {
            this._beforeUnloadHandler = (event) => {
               // We shouldn't close the tab if there are any pendings
               if (this._hasPendings()) {
                  event.preventDefault();
                  event.returnValue = '';
               } else {
                  window.removeEventListener('beforeunload', this._beforeUnloadHandler);
               }
            };
            window.addEventListener('beforeunload', this._beforeUnloadHandler);
         }
         const pendingOptions = {
            notifyHandler: (eventName: string, args?: []) => {
               return this._notify(eventName, args, {bubbling: true});
            }
         };
         this._pendingController = new PendingClass(pendingOptions);
      },

      _registerPendingHandler: function(e, def, config = {}) {
         this._pendingController.registerPending(def, config);
      },
      _unregisterPending: function(root, id) {
         this._pendingController.unregisterPending(root, id);
      },

      _hasPendings: function() {
         this._pendingController.hasPendings();
      },

      _hasRegisteredPendings: function(root = null) {
         return this._pendingController.hasRegisteredPendings(root);
      },
      _hideIndicators: function(root) {
         this._pendingController.hideIndicators(root);
      },

      _finishPendingHandler: function(event, forceFinishValue, root) {
         return this._pendingController.finishPendingOperations(forceFinishValue, root);
      },

      /**
       * Метод вернет завершенный Promise, когда все пендинги будут завершены.
       * Функции обратного вызова Promise с массивом результатов пендингов.
       * Если один из Promise'ов пендинга будет отклонен (вызовется errback), Promise также будет отклонен с помощью finishPendingOperations.
       * Если finishPendingOperations будет вызываться несколько раз, будет актуален только последний вызов, а другие возвращенные Promise'ы будут отменены.
       * Когда finishPendingOperations вызывается, каждый пендинг пытается завершится путем вызова метода onPendingFail.
       * @param forceFinishValue этот аргумент используется в качестве аргумента onPendingFail.
       * @returns {Deferred} Завершение Promise'а, когда все пендинги будут завершены.
       */

      /*
       * Method returns Promise resolving when all pendings will be resolved.
       * Promise callbacks with array of results of pendings.
       * If one of pending's Promise will be rejected (call errback), Promise of finishPendingOperations will be rejected too.
       * If finishPendingOperations will be called some times, only last call will be actual, but another returned Promises
       * will be cancelled.
       * When finishPendingOperations calling, every pending trying to finish by calling it's onPendingFail method.
       * If onPendingFail is not setted, pending registration notified control is responsible for pending's Promise resolving.
       * @param forceFinishValue this argument use as argument of onPendingFail.
       * @returns {Deferred} Promise resolving when all pendings will be resolved
       */

      finishPendingOperations: function(forceFinishValue, root = null) {
         return this._pendingController.finishPendingOperations(forceFinishValue, root);
      },
      _cancelFinishingPendingHandler: function(event, root) {
         return this._pendingController.cancelFinishingPending(root);
      },
      _beforeUnmount: function() {
         if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
         }
      }
   });

   export = module;

