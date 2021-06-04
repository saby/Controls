import base64 = require('Core/base64');
import { constants } from 'Env/Env';
import * as objectMerge from 'Core/core-merge';
import {Set} from 'Types/shim';
import { Logger } from 'UI/Utils';

const hrefMaxLength = 1499;
const onlySpacesRegExp = /^\s+$/;
const startsWIthNewlineRegExp = /^\s*\n/;
const paragraphTagNameRegExp = /^(p(re)?|div|blockquote)$/;
const charsToScreenRegExp = /([\\"])/g;
const classes = {
   wrap: 'LinkDecorator__wrap',
   link: 'LinkDecorator__linkWrap',
   image: 'LinkDecorator__image'
};
const fakeNeedDecorateAttribute = '__needDecorate';

const protocolNames = [
    'http:(?://|\\\\\\\\)',
    'https:(?://|\\\\\\\\)',
    'ftp:(?://|\\\\\\\\)',
    'file:(?://|\\\\\\\\)',
    'smb:(?://|\\\\\\\\)',
];
const correctTopLevelDomainNames = [
    'ru',
    'com',
    'edu',
    'org',
    'net',
    'int',
    'info',
    'рф',
    'рус'
];
const linkMaxLenght = 500;
const protocolLinkPrefixPattern = `(?:${protocolNames.join('|')})`.replace(/[a-z]/g, (m) => `[${m + m.toUpperCase()}]`);
const simpleLinkPrefixPattern = '([\\w\\-]{1,500}(?:\\.[a-zA-Z]{1,500}){0,500}\\.([a-zA-Z]{1,500})(?::[0-9]{1,500})?)';
const linkPrefixPattern = `(?:${protocolLinkPrefixPattern}|${simpleLinkPrefixPattern})`;
const linkPattern = `(${linkPrefixPattern}(?:[^\\s()\\ud800-\\udfff]{0,500}))`;
const emailPattern = '([\\wа-яёА-ЯЁ!#$%&\'*+\\-/=?^`{|}~.]{1,500}@[^\\s@()\\ud800-\\udfff]{1,500}\\.([\\wа-яёА-ЯЁ]{1,500}))';
const endingPattern = '([^.,:\\s()\\ud800-\\udfff\"\'])';
const characterRegExp = /[\wа-яёА-ЯЁ]/;
export const linkParseRegExp = new RegExp(`(?:(?:${emailPattern}|${linkPattern})${endingPattern})|(.|\\s)`, 'g');

const needDecorateParentNodeSet: Set<Array<any[]|string>> = new Set();
let stringReplacersArray: Array<any[]|string> = [];

function isAttributes(value) {
   return typeof value === 'object' && !Array.isArray(value);
}

function isElementNode(jsonNode) {
   return Array.isArray(jsonNode) && typeof jsonNode[0] === 'string';
}

function isTextNode(jsonNode) {
   return typeof jsonNode === 'string';
}

function getAttributes(jsonNode) {
   let result;
   if (isElementNode(jsonNode) && isAttributes(jsonNode[1])) {
      result = jsonNode[1];
   } else {
      result = {};
   }
   return result;
}

function getTagName(jsonNode) {
   let result;
   if (isElementNode(jsonNode)) {
      result = jsonNode[0];
   } else {
      result = '';
   }
   return result;
}

function getFirstChild(jsonNode) {
   let result;
   if (isElementNode(jsonNode)) {
      if (isAttributes(jsonNode[1])) {
         result = jsonNode[2];
      } else {
         result = jsonNode[1];
      }
   }
   if (!result) {
      result = '';
   }
   return result;
}

function createLinkNode(href: string, text: string = href, isEmail: boolean = false): Array<any> {
    const tagName = 'a';
    const attributes = {
        href: isEmail ? 'mailto:' + href : href
    };
    if (!isEmail) {
        attributes.class = 'asLink';
        attributes.target = '_blank';
        attributes.rel = 'noreferrer noopener';
    }
    return [tagName, attributes, text];
}

function createLinkObject(href: string, text: string = href, position: number, isEmail: boolean = false): object {
   const newHref = isEmail ? 'mailto:' + href : href;

   return {
      href: newHref,
      text,
      position
   };
}

function isLinkGoodForDecorating(linkNode) {
    const attributes = getAttributes(linkNode);
    const firstChild = getFirstChild(linkNode);

    const linkHref = attributes.href ? attributes.href.toLowerCase() : '';
    let decodedLinkHref;
    try {
        decodedLinkHref = decodeURI(linkHref);
    } catch (e) {
        // Защита от попытки декодирования ошибочной ссылки.
        Logger.warn('ошибка "' + e.message + '" при попытке декодировать URI ' + linkHref);
        decodedLinkHref = '';
    }
    const linkText = isTextNode(firstChild) ? firstChild.toLowerCase() : '';

    // Decorate link only with text == href, and href length shouldn't be more than given maximum.
    // And decorate link that starts with "http://" or "https://".
    return !!linkHref && linkHref.length <= getHrefMaxLength() && linkHref.indexOf('http') === 0 &&
        (linkHref === linkText || decodedLinkHref === linkText);
}

/**
 *
 * Модуль с утилитами для работы с декорированной ссылкой.
 *
 * @class Controls/_decorator/Markup/resources/linkDecorateUtils
 * @private
 * @author Угриновский Н.В.
 */

/**
 * Получает имена классов для декорирования ссылки.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getClasses
 * @returns {Object}
 */

/*
 * Get class names for decorating link.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getClasses
 * @returns {Object}
 */
export function getClasses() {
   return classes;
}

/**
 * Получает имя сервиса декорирования ссылок.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getService
 * @returns {String|undefined}
 */

/*
 * Get name of decorated link service.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getService
 * @returns {String|undefined}
 */
export function getService() {
   return constants.decoratedLinkService;
}

/**
 * Получает максимальную длину ссылки, которую можно задекорировать.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getHrefMaxLength
 * @returns {number}
 */

/*
 * Get name of decorated link service.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getHrefMaxLength
 * @returns {number}
 */
export function getHrefMaxLength() {
   // TODO: In this moment links with length 1500 or more are not being decorated.
   // Have to take this constant from the correct source. Problem link:
   // https://online.sbis.ru/opendoc.html?guid=ff5532f0-d4aa-4907-9f2e-f34394a511e9
   return hrefMaxLength;
}

/**
 * Проверяет, является ли json-нода с данным именем тега и нодой первого ребёнка декорированной ссылкой.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#isDecoratedLink
 * @param tagName {string}
 * @param firstChildNode {JsonML}
 * @returns {boolean}
 */

/*
 * Check if json node with given tag name and the first child node is a decorated link
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#isDecoratedLink
 * @param tagName {string}
 * @param firstChildNode {JsonML}
 * @returns {boolean}
 */
export function isDecoratedLink(tagName, firstChildNode) {
   let result;
   if (tagName === 'span') {
      const firstChildTagName = getTagName(firstChildNode);
      const firstChildAttributes = getAttributes(firstChildNode);

      result = firstChildTagName === 'a' && !!firstChildAttributes.href && !!firstChildAttributes.class &&
         firstChildAttributes.class.split(' ').indexOf(getClasses().link) !== -1;
   } else {
      result = false;
   }
   return result;
}

/**
 * Превращает декорированную ссылку в обычную. Вызывается после функции "isDecoratedLink", linkNode здесь - это firstChildNode там.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getUndecoratedLink
 * @param linkNode {jsonML}
 * @returns {jsonML}
 */

/*
 * Undecorate decorated link. Calls after "isDecoratedLink" function, link node here is the first child there.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getUndecoratedLink
 * @param linkNode {jsonML}
 * @returns {jsonML}
 */
export function getUndecoratedLink(linkNode) {
   const linkAttributes = getAttributes(linkNode);
   const newLinkAttributes = objectMerge({}, linkAttributes, { clone: true });

   // Save all link attributes, replace only special class name on usual.
   newLinkAttributes.class = linkAttributes.class.replace(getClasses().link, 'asLink');
   return ['a', newLinkAttributes, newLinkAttributes.href];
}

/**
 * Проверяет, является ли json-нода ссылкой, которая должна быть задекорирована.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#needDecorate
 * @param jsonNode {jsonML}
 * @param parentNode {jsonML}
 * @returns {boolean}
 */

/*
 * Check if json node is a link, that should be decorated.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#needDecorate
 * @param jsonNode {jsonML}
 * @param parentNode {jsonML}
 * @returns {boolean}
 */
export function needDecorate(jsonNode, parentNode) {
   // Can't decorate without decoratedLink service address.
   if (!getService()) {
      return false;
   }

   // Decorate link right inside paragraph.
   if (!paragraphTagNameRegExp.test(getTagName(parentNode))) {
      if (isTextNode(jsonNode)) {
          stringReplacersArray.unshift(wrapLinksInString(jsonNode, parentNode));
          return true;
      }
      return false;
   }

    // такая проверка, потому что первым ребёнком может оказаться строка, и проверка на === может ошибиться.
    const isFirstChild = !needDecorateParentNodeSet.has(parentNode);
    needDecorateParentNodeSet.add(parentNode);

   if (isFirstChild) {
      // Check all links in parentNode from the end to current, set attribute '__needDecorate' for all of them.
      // Set it true if two conditions are met:
      // 1. Link is good for decorating.
      // 2. Between link and the end of paragraph there are only spaces and other good for decorating links.
      let canBeDecorated = true;
      const firstChildIndex = isAttributes(parentNode[1]) ? 2 : 1;
      const localStringReplacersArray: Array<any[] | string> = [];
      for (let i = parentNode.length - 1; i >= firstChildIndex; --i) {
         const nodeToCheck = parentNode[i];
         if (isTextNode(nodeToCheck)) {
            let stringReplacer: any[] | string = wrapLinksInString(nodeToCheck, parentNode);
            localStringReplacersArray.unshift(stringReplacer);
            if (Array.isArray(stringReplacer) && canBeDecorated) {
               for (let j = stringReplacer.length - 1; j > 0; --j) {
                  let subNode = stringReplacer[j];
                  if (isTextNode(subNode)) {
                     canBeDecorated = (canBeDecorated && onlySpacesRegExp.test(subNode)) ||
                        startsWIthNewlineRegExp.test(subNode);
                  } else {
                     canBeDecorated = canBeDecorated && isLinkGoodForDecorating(subNode);
                     if (canBeDecorated) {
                        stringReplacer[j] = getDecoratedLink(subNode);
                     }
                  }
               }
            } else {
               canBeDecorated = (canBeDecorated && onlySpacesRegExp.test(nodeToCheck)) ||
                  startsWIthNewlineRegExp.test(nodeToCheck);
            }
            continue;
         }
         const tagName = getTagName(nodeToCheck);
         if (tagName === 'a') {
            const attributes = getAttributes(nodeToCheck);
            canBeDecorated = canBeDecorated && isLinkGoodForDecorating(nodeToCheck);
            attributes[fakeNeedDecorateAttribute] = canBeDecorated;
         } else {
            // Tag br is the end of paragraph.
            canBeDecorated = tagName === 'br';
         }
      }
      stringReplacersArray = localStringReplacersArray.concat(stringReplacersArray);
   }

   if (isTextNode(jsonNode)) {
      return true;
   }

   const attributes = getAttributes(jsonNode);
   if (attributes.hasOwnProperty(fakeNeedDecorateAttribute)) {
      const result = attributes[fakeNeedDecorateAttribute];
      delete attributes[fakeNeedDecorateAttribute];
      return result;
   }

   return false;
}

/**
 * Получает json-ноду деворированной ссылки. Вызывается после функции "needDecorate".
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getDecoratedLink
 * @param linkNode {JsonML}
 * @returns {JsonML}
 */

/*
 * Get json node of decorated link. Calls after "needDecorate" function.
 * @function Controls/_decorator/Markup/resources/linkDecorateUtils#getDecoratedLink
 * @param linkNode {JsonML}
 * @returns {JsonML}
 */
export function getDecoratedLink(jsonNode): any[]|string {
   if (isTextNode(jsonNode)) {
      return stringReplacersArray.shift();
   }

   const linkAttributes = getAttributes(jsonNode);
   const newLinkAttributes = objectMerge({}, linkAttributes, { clone: true });
   const decoratedLinkClasses = getClasses();

   newLinkAttributes.class = ((newLinkAttributes.class ? newLinkAttributes.class.replace('asLink', '') + ' ' : '') +
      decoratedLinkClasses.link).trim();
   newLinkAttributes.target = '_blank';
   if (!newLinkAttributes.rel || newLinkAttributes.rel.indexOf('noopener') === -1) {
      newLinkAttributes.rel = 'noopener';
   }

   const image = constants.decoratedLinkHost +
      getService() + '?method=LinkDecorator.DecorateAsSvg&params=' + encodeURIComponent(
         base64.encode('{"SourceLink":"' + newLinkAttributes.href.replace(charsToScreenRegExp, '\\$1') + '"}')
      ) + '&id=0&srv=1';

   return ['span',
      { 'class': decoratedLinkClasses.wrap },
      ['a',
         newLinkAttributes,
         ['img',
            { 'class': decoratedLinkClasses.image, alt: newLinkAttributes.href, src: image }
         ]
      ]
   ];
}

/**
 *
 * @param {string} stringNode
 * @param {any[]} parentNode
 * @return {any[] | string}
 */
export function wrapLinksInString(stringNode: string, parentNode: any[]): any[]|string {
   let result: any[]|string = [];
   let hasAnyLink: boolean = false;

   if (getTagName(parentNode) === 'a') {
      // Не нужно оборачивать ссылки внутри тега "a".
      result = stringNode;
   } else {
      [result, hasAnyLink] = parseLinks(stringNode, true);
   }

   return hasAnyLink ? result : stringNode;
}

export function parseLinks(stringNode: string, needToCreateLinkNode: boolean): [any[] | string, boolean] {
   let linkParseExec = linkParseRegExp.exec(stringNode);
   let result: any[]|string = [];
   let hasAnyLink: boolean = false;
   result.push([]);

   while (linkParseExec !== null) {
      let [match, email, emailDomain, link, simpleLinkPrefix, simpleLinkDomain, ending, noLink] = linkParseExec;
      const position = linkParseExec.index;
      linkParseExec = linkParseRegExp.exec(stringNode);
      let nodeToPush: any[]|string;

      if (match.length >= linkMaxLenght) {
         nodeToPush = match;
      } else if (link) {
         [hasAnyLink, nodeToPush] = normalizeLink(link, simpleLinkDomain, ending,
            simpleLinkPrefix, match, needToCreateLinkNode);

         if (hasAnyLink && !needToCreateLinkNode) {
            nodeToPush = createLinkObject(nodeToPush as string, match, position, false);
         }
      } else if (email) {
         const isEndingPartOfEmail = characterRegExp.test(ending);

         if (isEndingPartOfEmail) {
            emailDomain += ending;
            email += ending;
         }

         const wrongDomain = correctTopLevelDomainNames.indexOf(emailDomain) === -1;
         hasAnyLink = hasAnyLink || !wrongDomain;
         if (hasAnyLink && !needToCreateLinkNode) {
            nodeToPush = createLinkObject(email, match, position, true);
         } else {
            nodeToPush = wrongDomain ? match : createLinkNode(
               email,
               undefined,
               true
            );
         }
      } else {
         nodeToPush = noLink;
      }

      if (hasAnyLink && !needToCreateLinkNode) {
         result.push(nodeToPush);
      } else if (typeof nodeToPush === 'string' && typeof result[result.length - 1] === 'string') {
         result[result.length - 1] += nodeToPush;
      } else {
         result.push(nodeToPush);
      }
   }

   return [result, hasAnyLink];
}

/**
 * Ищет в строке ссылки и возвращает массив найденных ссылок
 * @param {string} string
 * @return {string[]}
 */
export function getLinks(string: string): string[] {
   const result: string[] = [];
   let isCorrectLink: boolean = false;
   let linkParseResult = linkParseRegExp.exec(string);

   while (linkParseResult !== null) {
      let [match, , , linkToCheck, linkPrefix, linkDomain, ending] = linkParseResult;
      let linkToPush: string[] | string;

      if (linkToCheck) {
         [isCorrectLink, linkToPush] = normalizeLink(linkToCheck, linkDomain, ending,
            linkPrefix, match, false);

         if (isCorrectLink && typeof linkToPush === 'string') {
            result.push(linkToPush);
         }
      }

      linkParseResult = linkParseRegExp.exec(string);
   }

   return result;
}

/**
 * Функция проверяет корректность параметров для формирования ссылки
 * и формирует на их основе верную ссылку
 * @param {string} linkToCheck
 * @param {string} linkDomain
 * @param {string} ending
 * @param {string} linkPrefix
 * @param {string} match
 * @param {boolean} needToCreateLinkNode
 * @return {boolean, string | string[]}
 */
export function normalizeLink(linkToCheck: string, linkDomain: string, ending: string,
   linkPrefix: string, match: string, needToCreateLinkNode: boolean):
   [boolean, string | string[]] {
   const isEndingPartOfDomain = characterRegExp.test(ending) && linkToCheck === linkPrefix;
   if (isEndingPartOfDomain) {
      linkDomain += ending;
   }
   const isWrongDomain = linkDomain && correctTopLevelDomainNames.indexOf(linkDomain) === -1;
   const isCorrectLink = !isWrongDomain;
   linkToCheck = linkToCheck + ending;

   if (needToCreateLinkNode) {
      const result = isWrongDomain ? match : createLinkNode(
         (linkPrefix ? 'http://' : '') + linkToCheck, linkToCheck);
   
      return [isCorrectLink, result];
   }

   const result = isWrongDomain ? match : linkPrefix ? 'http://' + linkToCheck : '' + linkToCheck;
   return [isCorrectLink, result];
}

export function clearNeedDecorateGlobals() {
    needDecorateParentNodeSet.clear();
    stringReplacersArray = [];
}
