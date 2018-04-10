define("File/Attach/Uploader", ["require", "exports", "File/Attach/Container/Source", "Core/ParallelDeferred"], function (require, exports, SourceContainer, ParallelDeferred) {
    "use strict";
    /**
     * Класс для агрегации загрузки через нескольких источников данных
     * @class
     * @name File/Attach/Uploader
     * @author Заляев А.В.
     */
    var Uploader = /** @class */ (function () {
        /**
         *
         * @param {File/Attach/Container/Source} container
         * @param {String} fileProperty
         * @param {Function} notify
         * @constructor
         * @name File/Attach/Uploader
         */
        function Uploader(container, fileProperty, notify) {
            if (fileProperty === void 0) { fileProperty = "File"; }
            this.fileProperty = fileProperty;
            /**
             * Список событий, необходимых к пробрасыванию от ISource
             * @type {Array<String>}
             * @private
             */
            this._events = ["onProgress", "onWarning", "onLoadedFolder"];
            if (!container || !(container instanceof SourceContainer)) {
                throw new Error("Invalid arguments");
            }
            this._container = container;
            this._notify = notify;
        }
        /**
         *
         * @param {Array<File/IResource>} files Загружаемые файлы
         * @param {Object} [meta] Дополнительные мета-данные для отправки
         * @param {Object<Function>} [handlers]
         * @return {Core/Deferred<Array<WS.Data/Entity/Model | Error>>}
         * @name File/Attach/Uploader#upload
         * @method
         */
        Uploader.prototype.upload = function (files, meta, handlers) {
            var _this = this;
            var uploadDefArray;
            uploadDefArray = files.map(function (file) {
                return _this._uploadFile(file, meta);
            });
            var len = uploadDefArray.length;
            return new ParallelDeferred({
                steps: uploadDefArray,
                stopOnFirstError: false
            }).done().getResult().addCallbacks(function (results) {
                var array = results;
                if (!(results instanceof Array)) {
                    array.length = len;
                    array = Array.prototype.slice.call(array);
                }
                _this._notify("onLoaded", array);
                return array;
            }, function (error) {
                _this._notify("onLoadError", error);
                return error;
            });
        };
        /**
         * загрузка одного файла через ISource полученный из SourceContainer
         * @param {File/IResource} file Загружаемый файл
         * @param {Object} [meta] Дополнительные мета-данные для отправки
         * @return {Core/Deferred<WS.Data/Entity/Model | Error>}
         * @private
         * @name File/Attach/Uploader#_uploadFile
         * @method
         */
        Uploader.prototype._uploadFile = function (file, meta) {
            var _this = this;
            return this._container.get(file).addCallback(function (source) {
                _this._subscribeToSource(source);
                return source.create(meta || {}, file);
            }).addCallbacks(function (result) {
                _this._notify("onLoadedResource", file, result);
                return result;
            }, function (error) {
                _this._notify("onLoadResourceError", file, error);
                return error;
            });
        };
        /**
         * Подписка на события ISource для их дальнейшего проброса
         * @param {WS.Data/Source/ISource} source
         * @private
         */
        Uploader.prototype._subscribeToSource = function (source) {
            var _this = this;
            if (source.__attachSubscribed) {
                return;
            }
            this._events.forEach(function (eventName) {
                source.subscribe(eventName, function (event) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    _this._notify.apply(_this, [eventName].concat(args));
                });
            });
            source.__attachSubscribed = true;
        };
        return Uploader;
    }());
    return Uploader;
});
