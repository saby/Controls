/// <amd-module name="Controls/_dataSource/_error/Mode" />
/**
 * Перечисление. Способы отображения шаблона с сообщением об ошибке.
 * @class Controls/_dataSource/_error/Mode
 * @public
 * @author Северьянов А.А.
 * @todo Переписать как typedef, как появится возможность автодоки прогружать из библиотек тайпдефы
 */
enum Mode {
    /**
     * @name Controls/_dataSource/_error/Mode#dialog
     * @cfg {string} В диалоговом окне.
     */
    dialog = 'dialog',
    /**
     * @name Controls/_dataSource/_error/Mode#page
     * @cfg {string} Во всю страницу.
     */
    page = 'page',
    /**
     * @name Controls/_dataSource/_error/Mode#include
     * @cfg {string} В области контрола (вместо содержимого).
     */
    include = 'include',
    /**
     * @name Controls/_dataSource/_error/Mode#inlist
     * @cfg {string} В области списка (вместе с содержимым).
     */
    inlist = 'inlist'
}

export default Mode;
