define('Controls/Utils/IntersectionObserver',
   [
      'Controls/sizeUtils',
      'Controls/Utils/OldUtilLogger'
   ],
   function(sizeUtils, oldUtilLogger) {
       oldUtilLogger.default('Controls/Utils/IntersectionObserver', 'Controls/sizeUtils:IntersectionObserver');
      return sizeUtils.IntersectionObserver;
   });
