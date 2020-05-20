define('Controls-demo/TestXslt/TestXslt', [
   'Core/Control',
   'wml!Controls-demo/TestXslt/TestXslt',
   'Core/xslt-async',
   'is!browser?jquery',
], function(Control, template, Xslt) {
   'use strict';

   function unescape(s) {
      if (!s || !s.replace) {
         return s;
      }
      var translateRe = /&(nbsp|amp|quot|apos|lt|gt);/g,
         translateDict = {
            nbsp: String.fromCharCode(160),
            amp: '&',
            quot: '\'',
            apos: '\'',
            lt: '<',
            gt: '>'
         };
      return s.replace(translateRe, function(match, entity) {
         return translateDict[entity];
      });
   }

   var ModuleClass = Control.extend({
      _template: template,
      _xml: '',
      _xsl: '',
      _result: '',
      status: 'Не проверено',
      check: function() {
         var self = this;
         self.refresh();
         var a = new Xslt({
            xml: self._xml,
            xsl: self._xsl,
            errback: function() {
               self.refused();
            }
         });
         a.execute().then(function() {
            if (a.checkDocument(a._xmlDoc)) {
               self.refused();
               return;
            }
            a.transformToText().then(function(result) {
               self.checkResult(result, self._result) ? self.passed() : self.refused();
            }, function() {
               self.refused();
            });
         }, function() {
            self.refused();
         });
      },
      attrSort: function(match) {
         // в Edge xslt преобразование может поменять местами атрибуты. Отсортируем их, чтобы точно всё было одинаково.
         var attrsBegin = match.indexOf(' ') + 1,
            attrsEnd = match.lastIndexOf('"');
         if (!~attrsEnd) {
            return match;
         }

         var beforeAttrs = match.substring(0, attrsBegin),
            sortedAttrs = match.substring(attrsBegin, attrsEnd).split('" ').sort().join('" '),
            afterAttrs = match.substr(attrsEnd);

         return beforeAttrs + sortedAttrs + afterAttrs;
      },
      refresh: function() {
         this.status = 'Не проверено';
      },
      passed: function() {
         this.status = 'Верно';
      },
      refused: function() {
         this.status = 'Неверно';
      },

      checkResult: function(checkStr, goodStr) {
         if (~checkStr.indexOf('<transformiix:result xmlns:transformiix="http://www.mozilla.org/TransforMiix">')) {
            checkStr = checkStr.replace(/<(\/|)transformiix:result[^>]*>/g, '');

            // Потому что Файрфокс. Может почему-то эскейпить результат, а может нет.
            var indexOfLtCode = checkStr.indexOf('&lt;');
            var indexOfRealLt = checkStr.indexOf('<');
            if (indexOfLtCode !== -1 && (indexOfRealLt === -1 || indexOfLtCode < indexOfRealLt)) {
               checkStr = unescape(checkStr);
            }
         }
         var toAttrSortRegExp = /<[^/][^>]*>/g;
         var toRemoveRegExp = /(\r)|(\n)|(<html[^>]*>)|(<\/html>)|(<head[^>]*>)|(<\/head>)|(<body[^>]*>)|(<\/body>)|(<tbody[^>]*>)|(<\/tbody>)|( )|(\t)|(xmlns="http:\/\/www\.w3\.org\/1999\/xhtml")/g;
         var brRegExp = /<\/?br[^>]*>/g;
         checkStr = checkStr.replace(toAttrSortRegExp, this.attrSort).replace(toRemoveRegExp, '').replace(brRegExp, '<br>');
         goodStr = goodStr.replace(toAttrSortRegExp, this.attrSort).replace(toRemoveRegExp, '').replace(brRegExp, '<br>');
         return  goodStr.indexOf(checkStr) === 0;
      }
   });

   ModuleClass._styles = ['Controls-demo/TestXslt/TestXslt'];

   return ModuleClass;
});
