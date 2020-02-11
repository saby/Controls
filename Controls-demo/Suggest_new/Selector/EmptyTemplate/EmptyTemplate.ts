import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Selector/EmptyTemplate/EmptyTemplate');
import suggestTemplate = require('wml!Controls-demo/Suggest_new/Selector/EmptyTemplate/resources/SuggestTemplate');
import 'wml!Controls-demo/Suggest_new/Selector/EmptyTemplate/resources/EmptyTemplate';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Suggest_new/Index';

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _demoEmptyTemplate: TemplateFunction = suggestTemplate;
   protected _source: Memory;
   protected _navigation: object;
   protected _beforeMount() {
      this._source = new Memory({
         data: []
      });
      this._navigation = {
         source: 'page',
         view: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      };
   }
}