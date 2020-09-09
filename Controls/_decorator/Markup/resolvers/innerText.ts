/**
 * Created by rn.kondakov on 06.12.2018.
 */

/**
 *
 * Модуль с функцией получения внутреннего текста из json.
 * Распознаватель тегов для jsonToHtml в {@link Controls/decorator:Converter}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_decorator.less">переменные тем оформления</a>
 *
 * @class Controls/_decorator/Markup/resolvers/innerText
 * @public
 * @author Кондаков Р.Н.
 */

/*
 *
 * Module with a function to get inner text from json.
 * Tag resolver for jsonToHtml in {@link Controls/decorator/Converter}.
 *
 * @class Controls/_decorator/Markup/resolvers/innerText
 * @public
 * @author Кондаков Р.Н.
 */
const innerText = function innerText(value, parent) {
   if (typeof value === 'string') {
      return parent ? value : [[], value];
   }
   if (Array.isArray(value)) {
      let newValue: string|any[] = '';
      if (Array.isArray(value[0])) {
         newValue = innerText(value[0], value);
      }
      for (let i = 1; i < value.length; ++i) {
         newValue += innerText(value[i], value);
      }
      if (value[0] === 'p' || value[0] === 'br') {
         newValue += '\n';
      }
      return parent ? newValue : [[], newValue];
   }
   return '';
};
// @ts-ignore
innerText.__noNeedEscapeString = true;

export default innerText;
