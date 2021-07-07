// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!Controls-demo/Async/_asyncDemo/TabsBlock/TabsBlock');

import 'css!Controls-demo/Async/AsyncDemo';

interface ITabsBlockOptions {
   selectedTab?: string;
}

class TabsBlock extends Control {
   _template: Function = template;

   private _tabCount: number = 3;
   protected _selectedTabId: number = 0;

   _beforeMount(cfg: ITabsBlockOptions): void {
      // cfg.selectedTab is passed in options as a string by Router.Route
      this._setSelectedTab(Number.parseInt(cfg.selectedTab, 10));
   }

   _beforeUpdate(cfg: ITabsBlockOptions): void {
      // Whenever the selectedTab in the URL changes, Router.Route triggers
      // an update
      this._setSelectedTab(Number.parseInt(cfg.selectedTab, 10));
   }

   private _setSelectedTab(selectedTab: number): void {
      // We have to make sure that the selected tab is valid, because URL can be
      // changed externally, for example manually by user
      if (selectedTab >= 0 && selectedTab < this._tabCount) {
         this._selectedTabId = selectedTab;
      } else {
         this._selectedTabId = 0;
      }
   }
}

export = TabsBlock;
