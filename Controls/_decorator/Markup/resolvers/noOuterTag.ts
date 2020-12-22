   /**
    *
    * Модуль с функцией получения html без внешнего тега.
    * Распознаватель тегов для jsonToHtml в {@link Controls/decorator:Converter}.
    * @remark Подробнее о формате JsonML читайте {@link /doc/platform/developmentapl/service-development/service-contract/logic/json-markup-language/ здесь}.
    * 
    * @class Controls/_decorator/Markup/resolvers/noOuterTag
    * @public
    * @author Угриновский Н.В.
    */

   /*
    *
    * Module with a function to get html without outer tag.
    * Tag resolver for jsonToHtml in {@link Controls/decorator:Converter}.
    *
    * @class Controls/_decorator/Markup/resolvers/noOuterTag
    * @public
    * @author Угриновский Н.В.
    */    
   export default function noOuterTag(value, parent) {
      if (!parent && value[0] === 'div') {
         value[0] = [];
      }
      return value;
   };

