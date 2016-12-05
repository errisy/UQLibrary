/**
 * This class allows you to genenerate url encoded form data;
 * the key-value pairs will be presented as 'key=value&key=value&....' in the data property.
 */
class FormUrlEncoded {
    constructor() {
        this.values = [];
        /**
         * append key-value pairs to the form;
         */
        this.append = (key, value) => {
            this.values.push(key + '=' + value);
        };
    }
    /**
     * A config that set 'Content-type' to 'application/x-www-form-urlencoded';
     */
    static get config() {
        return {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        };
    }
    /**
     * Get the string value with data in as 'key=value&key=value&....' format;
     */
    get data() {
        return this.values.join('&');
    }
}
class DeferredScript {
    constructor() {
        this.onSuccess = (data) => {
            this.value = data;
            //console.log('script loaded:');
            //console.log(this.value);
            if (this.callback)
                this.callback();
        };
        this.load = () => {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = this.value;
            //script.src = this.src;
            document.body.appendChild(script);
            //console.log('script loaded: ' + this.src);
        };
        /**
        * Guard Function: if ({DeferredScript}.isNotReady(() => this.{Current Function}(map))) return;
        * This function allows you to call back to the function that runs the call so that you can keep waiting until all scripts are loaded.
        */
        this.isNotReady = (callback) => {
            //console.log('isNotReady Called: ' + this.src);
            this.callback = callback;
            if (this.value) {
                //console.log('start script loading: ' + this.src);
                this.load();
                //this.callback();
                return false;
            }
            else {
                return true;
            }
        };
    }
}
class DeferredScriptLoaderService {
    constructor($http) {
        //console.log('DeferredScriptLoaderFactory: ');
        for (var i = 0; i < DeferredScriptLoaderService.scripts.length; i++) {
            var script = DeferredScriptLoaderService.scripts[i];
            $http.get(script.src).success(script.onSuccess);
        }
    }
    static add(src) {
        var script = new DeferredScript();
        script.src = src;
        DeferredScriptLoaderService.scripts.push(script);
        return script;
    }
}
DeferredScriptLoaderService.$inject = ['$http'];
DeferredScriptLoaderService.scripts = [];
var ngstd;
(function (ngstd) {
    var debugging = false;
    /**
     * the base class for types that can be used for model, where name of the type is important for selecting the template.
     */
    class NamedObject {
        get TypeName() {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((this).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        }
        ;
        clone(value) {
            for (var attr in value) {
                //console.log(this.TypeName + ".hasOwnProperty" + attr + " :" + this.hasOwnProperty(attr));
                if (attr != "TypeName" && value.hasOwnProperty(attr))
                    this[attr] = value[attr];
            }
        }
    }
    ngstd.NamedObject = NamedObject;
    /**
     * This function deserializes json object by the TypeName property. Your TypeName must contains the module name and class name for eval() call;
     * @param json
     */
    function TypedJSON(json) {
        var copy;
        // Handle the 3 simple types, and null or undefined
        if (null == json || "object" != typeof json)
            return json;
        // Handle Date
        if (json instanceof Date) {
            copy = new Date();
            copy.setTime(json.getTime());
            return copy;
        }
        // Handle Array
        if (json instanceof Array) {
            copy = [];
            for (var i = 0, len = json.length; i < len; i++) {
                copy[i] = TypedJSON(json[i]);
            }
            return copy;
        }
        // Handle Object
        if (json instanceof Object) {
            var TypeName = "TypeName";
            var name;
            if (json.hasOwnProperty(TypeName)) {
                //to use eval to create new class;
                name = json[TypeName];
                copy = eval("new " + name + "()");
            }
            else {
                copy = {};
            }
            for (var attr in json) {
                if (attr != "TypeName" && json.hasOwnProperty(attr))
                    copy[attr] = TypedJSON(json[attr]);
            }
            return copy;
        }
    }
    ngstd.TypedJSON = TypedJSON;
    function SerializeJSON(object) {
        //console.log('Serizlizing: ' + object);
        if (typeof object === 'boolean')
            return JSON.stringify(object);
        if (object instanceof Date)
            return JSON.stringify(object);
        if (typeof object === 'string')
            return JSON.stringify(object);
        if (typeof object === 'number')
            return JSON.stringify(object);
        if (object instanceof RegExp)
            return JSON.stringify(object);
        //Handle null
        if (!object)
            return 'null';
        //Handle Array
        if (object instanceof Array) {
            var codes = [];
            for (var i = 0; i < object.length; i++) {
                codes.push(SerializeJSON(object[i]));
            }
            return '[' + codes.join(',') + ']';
        }
        if (object instanceof Object) {
            var codes = [];
            //console.log(object instanceof ngstd.NamedObject);
            if (object instanceof ngstd.NamedObject) {
                codes.push('"TypeName": "' + object.TypeName + '"');
            }
            for (var attr in object) {
                //console.log('Attribute: ' + attr + '; OwnProperty: ' + object.hasOwnProperty(attr));
                if (object.hasOwnProperty(attr)) {
                    //console.log('"' + attr + '":' + SerializeJSON(object[attr]));
                    //console.log(object[attr]);
                    codes.push('"' + attr + '":' + SerializeJSON(object[attr]));
                }
            }
            return '{' + codes.join(',') + '}';
        }
    }
    ngstd.SerializeJSON = SerializeJSON;
    class PathModel {
    }
    ngstd.PathModel = PathModel;
    /**
     * An implementation of Angular Module. A few important setting features are provided as standard functions.
     */
    class AngularModule {
        constructor(name, modules, configFn) {
            /**
             * enables html5 mode for using base<path> and location service;
             */
            this.LocationHtml5Mode = () => {
                this.app.config(['$locationProvider',
                        ($locationProvider) => {
                        $locationProvider.html5Mode(true);
                    }
                ]);
            };
            /**
             * Include Content Directive in this module;
             */
            this.includeContentDirective = () => {
                this.addInjectedDirective('content', () => new ContentDirective());
            };
            /**
             *
             */
            this.includeTreeDirective = () => {
                this.addInjectedDirective('tree', ($compile, $http) => new TreeDirective($compile, $http));
            };
            /**
             * Include Sheet Directive in this module;
             */
            this.includeSheetDirective = () => {
                this.addInjectedDirective('sheet', () => new SheetDirective());
            };
            /**
             * Include Image Directive in this module;
             */
            this.includePictureDirective = () => {
                this.addInjectedDirective('picture', () => new PictureDirective());
            };
            this.includeOpenFileDirective = () => {
                this.addInjectedDirective('openfile', ($compile) => new OpenFileDirective($compile));
            };
            this.includeMenuGroupDirective = () => {
                this.addInjectedDirective('menuGroup', () => new MenuGroupDirective());
            };
            this.includeImageSlideDirective = (name) => {
                this.addInjectedDirective(name ? name : 'imageslide', () => new ImageSlideDirective());
            };
            this.includeCaptchaDirecive = (name) => {
                this.addInjectedDirective(name ? name : 'captcha', () => new ngstd.CaptchaDirective());
            };
            this.includeFileUploadDirective = (name) => {
                this.addInjectedDirective(name ? name : 'fileupload', () => new ngstd.FileUploadDirective());
            };
            this.includeMouseSelectDirective = (name) => {
                this.addInjectedDirective(name ? name : 'mouseselect', ($window) => new ngstd.MouseSelectDirective($window));
            };
            this.includePagesFilter = () => {
                //split the string and return empty
                this.app.filter('pages', () => {
                    return (input, numberPerPage) => {
                        var arr = [];
                        for (var i = 0; i < Math.ceil(input / numberPerPage); i++) {
                            arr.push({ index: i * numberPerPage, page: i + 1 });
                        }
                        return arr;
                    };
                });
            };
            /**
             * convert a number of PHP date to string date format. By default, the format is 'YYYY-MM-DD HH:mm:ss';
             */
            this.includePHPDateFilter = () => {
                //split the string and return empty
                this.app.filter('phpdate', () => {
                    return (input, format) => {
                        if (!format)
                            format = 'YYYY-MM-DD HH:mm:ss';
                        return moment('1970-01-01 00:00:00').add(input, 'second').format(format);
                    };
                });
            };
            this.includeStartFromFilter = () => {
                //split the string and return empty
                this.app.filter('startFrom', () => {
                    return (input, start) => {
                        if (typeof start != 'number' || isNaN(start) || start < 0)
                            start = 0;
                        start = start; //parse to int
                        if (!input)
                            return [];
                        if (!Array.isArray(input))
                            return input;
                        return input.slice(start);
                    };
                });
            };
            this.includePageDirective = (name) => {
                //split the string and return empty
                this.addInjectedDirective(name ? name : 'page', () => new ngstd.PageDirective());
            };
            this.includeSplitFilter = () => {
                //split the string and return empty
                this.app.filter('split', () => {
                    return (input, splitchar) => {
                        var arr = [];
                        if (input)
                            input.split(splitchar)
                                .forEach((value, index, source) => {
                                if (value)
                                    if (value.length > 0)
                                        arr.push(value);
                            });
                        return arr;
                    };
                });
            };
            this.includeGalleryFilter = () => {
                //split the string and return empty
                this.app.filter('gallery', () => {
                    return (input, splitchar) => {
                        var arr = [];
                        if (input)
                            input.split(splitchar)
                                .forEach((value, index, source) => {
                                if (value)
                                    if (value.length > 0)
                                        arr.push({ thumb: value, img: value, description: null });
                            });
                        return arr;
                    };
                });
            };
            this.includeFirstImageFilter = () => {
                //split the string and return empty
                this.app.filter('firstimage', () => {
                    return (input, splitchar) => {
                        var arr = [];
                        if (input)
                            input.split(splitchar)
                                .forEach((value, index, source) => {
                                if (value)
                                    if (value.length > 0)
                                        arr.push(value);
                            });
                        return arr[0];
                    };
                });
            };
            this.includeString2DateFilter = () => {
                //split the string and return empty
                this.app.filter('string2date', () => {
                    return (input) => {
                        return moment(input).toDate();
                    };
                });
            };
            this.includeDecimal = (name) => {
                this.addInjectedDirective(name ? name : 'decimal', () => new DecimalDirective());
            };
            this.includeImageEditorDirective = (name) => {
                this.addInjectedDirective(name ? name : 'imageEditor', () => new ImageEditorDirective());
            };
            this.includeString2DateDirective = (name) => {
                this.addInjectedDirective(name ? name : 'string2date', () => new String2DateModelConversionDirective());
            };
            /**
            * include DynamicTBody directive with default name 'dynamic';
            */
            this.includeDynamicTBody = (name) => {
                this.addInjectedDirective(name ? name : 'dynamic', ($compile) => new DynamicTBodyDirective($compile));
            };
            this.includeTimeDrirective = (name) => {
                this.addInjectedDirective(name ? name : 'time', ($compile) => new TimeDirective($compile));
            };
            this.includeDateTimeDrirective = (name) => {
                this.addInjectedDirective(name ? name : 'datetime', ($compile) => new DateTimeDirective($compile));
            };
            this.includeNum2StrDirective = (name) => {
                this.addInjectedDirective(name ? name : 'num2str', () => new Num2StrModelConversionDirective());
            };
            this.includeBool2StrDirective = (name) => {
                this.addInjectedDirective(name ? name : 'bool2str', () => new TinyInt2BoolModelConverstionDirective());
            };
            this.includeGalleryDirective = (name) => {
                this.addInjectedDirective(name ? name : 'gallery', () => new GalleryDirective());
            };
            if (!modules)
                modules = [];
            this.app = angular.module(name, modules, configFn);
        }
        config(configFn) {
            this.app.config(configFn);
        }
        trustUrl(pattern) {
            this.app.config(function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(pattern);
            });
        }
        addController(controllerType) {
            //check if valid selector is provided.
            if (!controllerType.selector || typeof controllerType.selector != 'string') {
                console.error('Missing static selector field in type:', controllerType);
                throw 'Error: Missing static selector field in the AngularController type!';
            }
            this.app.controller(controllerType.selector, controllerType);
        }
        addControllerAsSelector(selector, controller) {
            this.app.controller(selector, controller);
        }
        /**
         * Add a directive to the Angular Module;
         * @param name is the name of the directive
         * @param factory is the factory function such as ()=>new Directive(). Directive name won't work.
         */
        addInjectedDirective(name, factory) {
            this.app.directive(name, factory);
        }
        addDirective(directiveType) {
            //check if valid selector is provided.
            if (!directiveType.selector || typeof directiveType.selector != 'string') {
                console.error('Missing static selector field in type:', directiveType);
                throw 'Error: Missing static selector field in the AngularDirective type!';
            }
            this.app.directive(directiveType.selector, () => new directiveType());
        }
        addStdDirective(name, templateUrl, Controller) {
            this.app.directive(name, () => {
                return {
                    restrict: 'E',
                    templateUrl: templateUrl,
                    controller: Controller,
                    scope: {
                        app: '=',
                        data: '=',
                        model: '=',
                        parent: '='
                    },
                    controllerAs: 'controller'
                };
            });
        }
        addFactory(name, factory) {
            this.app.factory(name, factory);
        }
        addService(name, service) {
            this.app.service(name, service);
        }
        /**
         * include all member functions as filters into the current angular module;
         * @param filterObject a class with all filters defined as static methods;
         */
        includeFilters(filterObject) {
            for (let key in filterObject) {
                this.app.filter(key, () => filterObject[key]);
            }
        }
        /**
         * Provide access to the ng.IModule;
         */
        get Base() {
            return this.app;
        }
        includeLoaderController(name) {
            this.addControllerAsSelector(name ? name : 'loader', LoaderController);
        }
    }
    ngstd.AngularModule = AngularModule;
    class AngularController {
    }
    ngstd.AngularController = AngularController;
    /**
     * The controller to load app to avoid displaying uncompiled content.
     */
    class LoaderController extends AngularController {
        constructor($element) {
            super();
            this.$element = $element;
            //remove the loader class tag
            $element.removeClass('loader');
            //remove the loader-hide class tags;
            $element.find('.loader-hide').removeClass('loader-hide');
            //remove the loader-content elements:
            $element.find('.loader-content').remove();
        }
    }
    LoaderController.$inject = ['$element'];
    LoaderController.selector = 'loader';
    ngstd.LoaderController = LoaderController;
    /**
     *
     */
    class AppController {
        constructor() {
            /**
             * Template Selector by Type, this is a default selector
             */
            this.TemplateTypeSelector = (data, templates) => {
                var nType;
                var name;
                if (data) {
                    if (data instanceof Array) {
                        if (data.length)
                            if (data.length > 0) {
                                nType = data[0];
                                name = nType.TypeName + '[]';
                            }
                            else {
                                name = '';
                            }
                    }
                    else {
                        nType = data;
                        name = nType.TypeName;
                    }
                }
                else {
                    name = '';
                }
                //var resolver = new research.metadata.NameResolver();
                //console.log(resolver.getFullClassNameFromInstance(data, window));
                if (debugging)
                    console.log(name); //debugging swtich
                var result = '';
                templates.forEach((value, index, array) => {
                    if (value.type == name) {
                        result = value.template;
                        return;
                    }
                });
                return result;
            };
            /**
             * Template Selector. Always selector the first template.
             */
            this.TemplateFirstSelector = (data, templates) => {
                if (templates)
                    if (templates.length > 0) {
                        return templates[0].template;
                    }
                    else {
                        return '';
                    }
            };
        }
    }
    ngstd.AppController = AppController;
    class DirectiveRestrict {
    }
    DirectiveRestrict.E = 'E';
    DirectiveRestrict.A = 'A';
    DirectiveRestrict.AE = 'AE';
    DirectiveRestrict.C = 'C';
    ngstd.DirectiveRestrict = DirectiveRestrict;
    class BindingRestrict {
    }
    BindingRestrict.TwoWay = '=';
    BindingRestrict.In = '@';
    BindingRestrict.Callback = '&';
    BindingRestrict.TwoWayOptional = '=?';
    ngstd.BindingRestrict = BindingRestrict;
    class AngularDirective {
        constructor() {
            this.scope = {};
            return this;
        }
    }
    ngstd.AngularDirective = AngularDirective;
    class PageDirective extends AngularDirective {
        constructor() {
            super();
            this.restrict = 'A';
            this.scope.limit = BindingRestrict.TwoWayOptional;
            this.scope.total = BindingRestrict.TwoWayOptional;
            this.scope.pages = BindingRestrict.TwoWayOptional;
            this.link = (scope) => {
                var buildPages = () => {
                    var nLimit = scope.limit;
                    var nTotal = scope.total;
                    if (typeof nLimit == 'number' && !isNaN(nLimit)) {
                        if (nLimit < 1)
                            nLimit = 1;
                    }
                    if (typeof nTotal == 'number' && !isNaN(nTotal)) {
                        if (nTotal < 0)
                            nTotal = 0;
                    }
                    var arr = [];
                    for (var i = 0; i < Math.ceil(nTotal / nLimit); i++) {
                        arr.push({ index: i * nLimit, page: i + 1 });
                    }
                    scope.pages = arr;
                    //console.log(scope.pages, arr, nLimit, nTotal);
                };
                scope.$watch('limit', (nLimit, oLimit) => {
                    buildPages();
                });
                scope.$watch('total', (nTotal, oTotal) => {
                    buildPages();
                });
            };
        }
    }
    ngstd.PageDirective = PageDirective;
    class MouseSelectDirective extends ngstd.AngularDirective {
        constructor($window) {
            super();
            this.restrict = 'A';
            this.scope = null;
            this.link = (scope, element, attrs) => {
                element.bind('mouseenter', (ev) => {
                    if (!$window.getSelection().toString()) {
                        var input = element[0];
                        input.setSelectionRange(0, input.value.length);
                    }
                });
            };
        }
    }
    ngstd.MouseSelectDirective = MouseSelectDirective;
    class GalleryDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            //this.scope = null;
            this.restrict = 'E';
            this.scope.images = ngstd.BindingRestrict.TwoWay;
            this.scope.close = ngstd.BindingRestrict.Callback;
            this.template = '<div style="display: inline-flex;align-items: center;position: absolute;top:0;bottom:0;left:0;right:0;">'
                + '  <div style="width:100%;display: block;text-align:center;">'
                + '    <img height="300" ng-src="{{image}}"/>'
                + '  </div>'
                + '</div>'
                + '<div style="display: inline-flex;align-items: center;position: absolute;top:0;bottom:0;left:0;right:0;">'
                + '        <svg width="36" height="36" style="position: absolute; top:0;right:0;cursor:pointer;" ng-click="close()">'
                + '            <line x1="4" x2="32" y1="4" y2="32" style="stroke:rgb(255,0,0);stroke-width:6" />'
                + '            <line x1="32" x2="4" y1="4" y2="32" style="stroke:rgb(255,0,0);stroke-width:6" />'
                + '        </svg>'
                + '<div style="width:100%;display: block;">'
                + '<svg width="24" height="80" style="cursor: pointer; float: left; left: 0;" ng-click="previous()">'
                + '  <line x1="3" x2="21" y1="41" y2="0" stroke="white" stroke-width="6" />'
                + '  <line x1="3" x2="21" y1="39" y2="80" stroke="white" stroke-width="6" />'
                + '</svg>'
                + ''
                + '<svg width="24" height="80" style="cursor: pointer; float: right; right: 0;" ng-click="next()">'
                + '  <line x1="21" x2="3" y1="41" y2="0" stroke="white" stroke-width="6" />'
                + '  <line x1="21" x2="3" y1="39" y2="80" stroke="white" stroke-width="6" />'
                + '</svg>'
                + '</div>'
                + '</div>';
            this.link = (scope, element, attributes) => {
                var index = 0;
                element.css('background-color', 'rgba(0,0,0,0.6)');
                element.css('border', '1px solid red');
                element.css('border-radius', '10px');
                element.on('keydown', (ev) => {
                    console.log(ev.keyCode);
                });
                scope.previous = () => {
                    if (scope.images) {
                        if (Array.isArray(scope.images)) {
                            if (scope.images.length > 0) {
                                index += 1;
                                if (index >= scope.images.length)
                                    index = 0;
                                scope.image = scope.images[index];
                            }
                        }
                    }
                };
                scope.next = () => {
                    if (scope.images) {
                        if (Array.isArray(scope.images)) {
                            if (scope.images.length > 0) {
                                index -= 1;
                                if (index < 0)
                                    index = scope.images.length - 1;
                                scope.image = scope.images[index];
                            }
                        }
                    }
                };
                scope.$watch('images', (nValue, oValue) => {
                    console.log('images changed: ');
                    console.log(scope.images);
                    index = 0;
                    if (nValue) {
                        if (Array.isArray(nValue)) {
                            if (scope.images.length > 0) {
                                scope.image = scope.images[index];
                            }
                        }
                    }
                });
            };
        }
    }
    ngstd.GalleryDirective = GalleryDirective;
    /**
     * DataTemplate definition for Conent control.
     */
    class DataTemplate {
    }
    ngstd.DataTemplate = DataTemplate;
    class DirectiveViewController {
        constructor($scope, $element, $compile) {
            this.$scope = $scope;
            this.$element = $element;
            this.$compile = $compile;
        }
        get View() {
            return this._View;
        }
        set View(value) {
            this._View = value;
            //initialize the view;
            if (!value.selector || typeof value.selector != 'string') {
                console.error('Missing static selector field in the Angular Directive Type: ', value);
            }
            else {
                if (this.CurrentChildScope)
                    this.CurrentChildScope.$destroy();
                this.$element.children().remove();
                //try compile the 
                this.CurrentChildScope = this.$scope.$new();
                this.CurrentElement = this.$compile('<{0}></{0}>'.format(value.selector))(this.CurrentChildScope);
                this.$element.append(this.CurrentElement);
            }
        }
    }
    DirectiveViewController.$inject = ['$scope', '$element', '$compile'];
    ngstd.DirectiveViewController = DirectiveViewController;
    class DirectiveViewDirecive extends AngularDirective {
        constructor() {
            super();
            this.restrict = 'AE';
            this.scope.ref = '=?';
            this.controller = DirectiveViewController;
            this.controllerAs = 'ctrl';
        }
    }
    ngstd.DirectiveViewDirecive = DirectiveViewDirecive;
    /**
     * Content control controller. It accepts template elements to generate views for data.
     * It will invoke the selector to evaluate what view to use.
     * We suggest building a TabControl based on Content control.
     * Content control use $compile method to build element within subscope. subscope will be destroyed on the removal of corresponding element.
     */
    class ContentController {
        constructor($compile, $element, $http, $scope) {
            this.$compile = $compile;
            this.$element = $element;
            this.$http = $http;
            this.$scope = $scope;
            //private childscope: ng.IScope;
            this.templates = [];
            //this section will collect each of the view template from the inner of this model and they can be applied to each of the software.
            $element.children('template').each((index, elem) => {
                var $elem = $(elem);
                var template = new DataTemplate();
                template.key = $elem.attr('key');
                template.path = $elem.attr('path');
                template.type = $elem.attr('type');
                template.url = $elem.attr('url');
                template.jQuery = $elem;
                if (template.url) {
                    //the embedded template is used for loading process;
                    template.template = $elem.html();
                    $http.get(template.url)
                        .success((data) => {
                        template.template = data;
                        //we must check if the return value can affect the view of the content control.
                        if ($scope.selector)
                            if ($scope.view != $scope.selector($scope.data, this.templates)) {
                                //if view is affected, view must be updated.
                                $scope.view = $scope.selector($scope.data, this.templates);
                            }
                    });
                }
                else {
                    template.template = $elem.html();
                }
                this.templates.push(template);
            });
            $element.children().remove();
            $scope.$watch('data', (newValue, oldValue) => {
                if ($scope.selector) {
                    var template = $scope.selector(newValue, this.templates);
                    if (typeof template == 'string')
                        $scope.view = template;
                }
                else {
                    console.warn('Content View Warning: selector is undefined.\n' +
                        'Please provide a valid selector function:\n' +
                        'selector: (data: any, templates: DataTemplate[]) => string');
                }
            });
            //watch the view (string template) and compile it when changed.
            $scope.$watch('view', (newValue, oldValue) => {
                //console.log('$watch view');
                //distroy all child elements in the element.
                //if (this.childscope) {
                //    this.childscope.$destroy();//destroy the child scope
                //    $element.children().remove();//remove each of the child elments
                //}
                $element.children().remove();
                //create a new child scope.
                //this.childscope = $scope.$new();
                //append the complied element
                $element.append($compile(newValue)(this.$scope.$parent));
            });
        }
    }
    ContentController.$inject = ['$compile', '$element', '$http', '$scope'];
    ngstd.ContentController = ContentController;
    /**
 * Control directive.
 */
    class ContentDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.template = '';
            this.scope.data = ngstd.BindingRestrict.TwoWay;
            this.scope.view = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.controller = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.app = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.selector = ngstd.BindingRestrict.TwoWayOptional;
            this.controller = ContentController;
        }
    }
    ngstd.ContentDirective = ContentDirective;
    class TreeTemplate {
    }
    ngstd.TreeTemplate = TreeTemplate;
    /**
     * To use this directive, you must use the observable interface 'add(), remove(), removeAt(), clear()'
     */
    class TreeDirective extends ngstd.AngularDirective {
        constructor($compile, $http) {
            super();
            this.restrict = 'A';
            this.scope.tree = ngstd.BindingRestrict.TwoWay;
            this.scope.app = ngstd.BindingRestrict.TwoWay;
            this.scope.controller = ngstd.BindingRestrict.TwoWay;
            this.scope.modelBuilder = ngstd.BindingRestrict.TwoWay;
            this.scope.childrenSelector = ngstd.BindingRestrict.TwoWay;
            this.scope.templateSelector = ngstd.BindingRestrict.TwoWay;
            this.scope.templates = ngstd.BindingRestrict.TwoWayOptional;
            this.link = (scope, element, attrs) => {
                if (!scope.templates)
                    scope.templates = [];
                if (!Array.isArray(scope.templates))
                    scope.templates = [];
                //this will remove all the templates in the content;
                element.children('template').each((index, elem) => {
                    var $elem = $(elem);
                    var template = new TreeTemplate();
                    template.key = $elem.attr('key');
                    template.path = $elem.attr('path');
                    template.type = $elem.attr('type');
                    template.url = $elem.attr('url');
                    template.children = $elem.attr('children');
                    template.jQuery = $elem;
                    if (template.url) {
                        //the embedded template is used for loading process;
                        template.template = $elem.html();
                        $http.get(template.url)
                            .success((data) => {
                            template.template = data;
                            //we must check if the return value can affect the view of the content control.
                            //if (scope.selector) if (scope.view != scope.selector(scope.data, scope.templates)) {
                            //    //if view is affected, view must be updated.
                            //    scope.view = scope.selector(scope.data, scope.templates);
                            //}
                        });
                    }
                    else {
                        template.template = $elem.html();
                    }
                    scope.templates.push(template);
                });
                element.children('template').remove();
                var root = new TreeRoot(scope, element, $compile);
                root.refresh();
            };
        }
    }
    ngstd.TreeDirective = TreeDirective;
    class TreeItemBase {
        constructor() {
            this.children = [];
            /**
             * For observable interface of ItemsSource Watching, do not use this function;
             * @param array
             * @param item
             * @param index
             */
            this.onInsert = (array, item, index) => {
                this.insert(item, index);
            };
            /**
             * For observable interface of ItemsSource Watching, do not use this function;
             * @param array
             * @param item
             * @param index
             */
            this.onRemoveAt = (array, item, index) => {
                this.removeAt(index);
            };
            /**
             * For observable interface of ItemsSource Watching, do not use this function;
             * @param array
             */
            this.onClear = (array) => {
                this.clear();
            };
            /**
             * For observable interface of ItemsSource Watching, do not use this function;
             * @param array
             * @param item
             * @param from
             * @param to
             */
            this.onMoveTo = (array, item, from, to) => {
                this.moveTo(from, to);
            };
            // protected functions for TreeView logic
            this.updateApp = () => {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].scope.app = this.root.app;
                }
            };
            this.updateController = () => {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].scope.controller = this.root.controller;
                }
            };
            this.updateModelBuilder = () => {
                if (this.root.modelBuilder) {
                    for (var i = 0; i < this.children.length; i++) {
                        this.children[i].scope.model = this.root.modelBuilder(this.children[i].data, this.children[i]);
                    }
                }
                else {
                    for (var i = 0; i < this.children.length; i++) {
                        this.children[i].scope.model = null;
                    }
                }
            };
            this.updateChildrenView = () => {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].buildView();
                }
                this.renderChildren();
            };
            /**
             * For watch children array;
             * @param newValue
             * @param oldValue
             */
            this.childrenChanged = (newChildren, oldChildren) => {
                this.clearChildren();
                //detach all listeners;
                if (oldChildren) {
                    oldChildren.onInsert = null;
                    oldChildren.onRemoveAt = null;
                    oldChildren.onClear = null;
                    oldChildren.onMoveTo = null;
                }
                if (newChildren) {
                    //attach listeners to new value;
                    newChildren.onInsert = this.onInsert;
                    newChildren.onRemoveAt = this.onRemoveAt;
                    newChildren.onClear = this.onClear;
                    newChildren.onMoveTo = this.onMoveTo;
                    for (var i = 0; i < newChildren.length; i++) {
                        var data = newChildren[i];
                        var child = new TreeItem(data, this, this.level + 1);
                        child.index = i;
                        child.buildView();
                        this.children.push(child);
                    }
                    this.renderChildren();
                }
            };
            /**
             * clear children (perform remove on each child) but it doesn't update the children view; you need to call renderChildren to update view;
             * this function is for internal call;
             */
            this.clearChildren = () => {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].destroy();
                }
            };
            //public functions:
            /**
             * clear chilren (perform remove on each child), destory scope, remove view;
             */
            this.destroy = () => {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].destroy();
                }
                if (this.scope)
                    this.scope.$destroy();
                if (this.view)
                    this.view.remove();
                this.scope = null;
                this.view = null;
            };
            this.clear = () => {
                this.clearChildren();
                this.renderChildren();
            };
            /**
            * present the children in the order of children;
            */
            this.renderChildren = () => {
                if (this.presentor) {
                    //detach all children;
                    this.presentor.children().detach();
                    //append all children;
                    for (var i = 0; i < this.children.length; i++) {
                        this.children[i].index = i;
                        if (this.children[i].view)
                            this.presentor.append(this.children[i].view);
                    }
                }
            };
            /**
             * insert a data at 'index'
             * @param data
             * @param index
             */
            this.insert = (data, index) => {
                var child = new TreeItem(data, this, this.level + 1);
                if (index < 0)
                    index = 0;
                if (index > this.children.length)
                    index = this.children.length;
                child.index = index;
                child.buildView();
                this.children.splice(index, 0, child);
                //we also need to take care of the view;
                this.renderChildren();
            };
            this.removeAt = (index) => {
                var child = this.children[index];
                if (child) {
                    child.destroy();
                    this.children.splice(index, 1);
                    this.renderChildren();
                }
            };
            /**
             * Move a child from 'from' to 'to';
             * @param from
             * @param to
             */
            this.moveTo = (from, to) => {
                var child = this.children.splice(from, 1)[0];
                this.children.splice(to, 0, child);
                this.renderChildren();
            };
            /**
             * Move a child from 'from' position of this item to the 'to' position of the target item;
             * This function allows simple 'drag-drop' operation for the tree view.
             * @param from
             * @param target
             * @param to
             */
            this.moveToTreeItem = (from, target, to, rebuildView) => {
                var child = this.children.splice(from, 1)[0];
                this.renderChildren();
                child.parent = target;
                child.root = target.root;
                if (rebuildView)
                    child.buildView();
                target.children.splice(to, 1, child);
                target.renderChildren();
            };
            /**
             * Allow viewmodel to update the view;
             */
            this.refresh = () => {
                this.buildView();
                this.render();
            };
        }
    }
    ngstd.TreeItemBase = TreeItemBase;
    class TreeItem extends TreeItemBase {
        constructor(data, parent, level) {
            super();
            this.buildView = () => {
                this.destroy();
                var tempalte;
                if (this.root.templateSelector)
                    tempalte = this.root.templateSelector(this.data, this.root.templates);
                if (!tempalte)
                    if (this.root.templates)
                        tempalte = this.root.templates[0]; // by default use the first template;
                var templateHTML = '{{data}}<div presenter></div>';
                var childrenSource;
                if (tempalte) {
                    templateHTML = tempalte.template; //this is the default view for the tree view;
                    childrenSource = tempalte.children;
                }
                //echo('templateHTML: ' + templateHTML);
                this.scope = this.parent.scope.$new(true, this.parent.scope);
                this.scope.data = this.data;
                this.scope.controller = this.root.controller;
                if (this.root.modelBuilder)
                    this.scope.model = this.root.modelBuilder(this.data, this);
                this.scope.app = this.root.app;
                //add watch here?
                if (this.root.childrenSelector) {
                    var childrenSourceFromSelector = this.root.childrenSelector(this.data, this.parent.data, this.level);
                    if (childrenSourceFromSelector)
                        childrenSource = childrenSourceFromSelector;
                }
                if (childrenSource)
                    this.childrenWatchUnregister = this.scope.$watch('data.' + childrenSource, this.childrenChanged);
                this.view = this.root.compile(templateHTML)(this.scope);
                this.presentor = this.view.filter('div[presenter]');
                if (!this.presentor)
                    this.presentor = this.view.find('div[presenter]');
            };
            this.render = () => {
                this.parent.renderChildren();
                //this.parent.scope.$apply();
            };
            this.data = data;
            this.parent = parent;
            this.root = parent.root;
            //from root;
        }
    }
    ngstd.TreeItem = TreeItem;
    class TreeRoot extends TreeItemBase {
        constructor(scope, element, complie) {
            super();
            this.templates = [];
            this.buildView = () => {
                //we must watch the data;
                this.childrenWatchUnregister = this.scope.$watch('tree', this.childrenChanged);
            };
            this.render = () => {
                //nothing to do;
                //this.scope.$apply();
            };
            this.appWatcher = (newApp, oldApp) => {
                this.updateApp();
            };
            this.controllerWatcher = (newController, oldController) => {
                this.updateController();
            };
            this.modelBuilderWatcher = (newModelBuilder, oldModelBuilder) => {
                this.updateModelBuilder();
            };
            this.templatesWatcher = (newTemplates, oldTemplates) => {
                this.updateChildrenView();
            };
            this.templateSelectorWatcher = (newTemplateSelector, oldTemplateSelector) => {
                this.updateChildrenView();
            };
            this.childrenSelectorWatcher = (newChildrenSelector, oldChildrenSelector) => {
                this.updateChildrenView();
            };
            this.level = 0;
            this.scope = scope;
            this.compile = complie;
            this.view = element;
            this.presentor = element.find('div[presenter]');
            this.app = scope.app;
            this.controller = scope.controller;
            this.templates = scope.templates;
            this.modelBuilder = scope.modelBuilder;
            this.templateSelector = scope.templateSelector;
            this.childrenSelector = scope.childrenSelector;
            scope.$watch('app', this.appWatcher);
            scope.$watch('controller', this.controllerWatcher);
            this.root = this;
            if (!this.presentor) {
                console.log('Fetal Error in Tree Directive: No <div presentor></div> node was found. You must provide one <div presentor></div> in the Tree Directive to present the data.');
            }
        }
    }
    ngstd.TreeRoot = TreeRoot;
    /**
     * Decimal directive that make the Input Text only accept numbers and dot.
     */
    class DecimalDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.link = (scope, element, attr, ngModel) => {
                var acceptNegative = false;
                if (scope.acceptNegative) {
                    acceptNegative = Boolean(scope.acceptNegative);
                }
                var acceptDecimal = true;
                if (scope.acceptDecimal) {
                    acceptDecimal = Boolean(scope.acceptDecimal);
                }
                var converter = DecimalDirective.DecimalFormatter(DecimalNumber.validateNumber(scope.accuracy, 2));
                ngModel.$parsers.push(converter);
                ngModel.$formatters.push(converter);
                element.on('keydown', (e) => {
                    //console.log(e.keyCode);
                    switch (e.keyCode) {
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                        case 96:
                        case 97:
                        case 98:
                        case 99:
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                            break;
                        case 8:
                            break;
                        case 46:
                            break;
                        case 39:
                        case 37:
                            break;
                        case 38:
                        case 40:
                            break;
                        case 110:
                        case 190:
                            if (!acceptDecimal)
                                e.preventDefault();
                            break;
                        case 109:
                        case 189:
                            //console.log('acceptNegative: ' + acceptNegative.toString());
                            if (acceptNegative) {
                                var dec = new DecimalNumber(ngModel.$viewValue);
                                dec.positive = !dec.positive;
                                ngModel.$setViewValue(dec.toDecimal(DecimalNumber.validateNumber(scope.accuracy, 2)));
                                //console.log('ngModel.$viewValue: ' + ngModel.$viewValue);
                                ngModel.$render();
                            }
                            e.preventDefault();
                            break;
                        default:
                            e.preventDefault();
                            break;
                    }
                });
            };
            this.restrict = 'A';
            this.scope.accuracy = ngstd.BindingRestrict.In;
            this.scope.acceptNegative = ngstd.BindingRestrict.In;
            this.scope.acceptDecimal = ngstd.BindingRestrict.In;
            this.require = 'ngModel';
        }
        static DecimalFormatter(accuracy) {
            return (value) => (new DecimalNumber(value)).toDecimal(accuracy);
        }
    }
    ngstd.DecimalDirective = DecimalDirective;
    class String2DateModelConversionDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.link = (scope, element, attr, ngModel) => {
                //console.log('string2date link called');
                ngModel.$parsers.push(String2DateModelConversionDirective.Date2String);
                ngModel.$formatters.push(String2DateModelConversionDirective.String2Date);
            };
            //console.log('string2date directive init');
            this.restrict = 'A';
            this.require = 'ngModel';
            this.scope = null;
        }
        static String2Date(value) {
            //console.log('string to date: ' + value);
            //console.log(moment(value).toDate());
            return moment(value).toDate();
        }
        static Date2String(value) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
        }
    }
    ngstd.String2DateModelConversionDirective = String2DateModelConversionDirective;
    //dynamic directive
    class DynamicDirective {
        constructor() {
            this.scope = {};
            return this;
        }
    }
    ngstd.DynamicDirective = DynamicDirective;
    //we need a view directive that does not require a content, instead it will use a define viewbase, but not a complex directive view;
    class ViewBase {
        constructor() {
            this.destroy = () => {
                this.scope.$destroy();
                this.scope = null;
            };
        }
    }
    ngstd.ViewBase = ViewBase;
    class ViewDirectiveController {
        constructor($compile, $element, $http, $scope) {
            this.onViewChanged = (newValue, oldValue) => {
                //distroy all child elements in the element.
                if (oldValue) {
                    this.element.children().detach(); //remove each of the child elments
                }
                if (newValue) {
                    if (newValue.scope) {
                        this.element.append(newValue.element);
                    }
                    else {
                        //append the complied element
                        newValue.scope = this.scope.$new();
                        newValue.element = this.compile(newValue.template)(newValue.scope);
                        this.element.append(newValue.element);
                    }
                }
            };
            this.compile = $compile;
            this.element = $element;
            this.scope = $scope;
            $scope.$watch(() => $scope.view, this.onViewChanged);
        }
    }
    ViewDirectiveController.$inject = ['$compile', '$element', '$http', '$scope'];
    ngstd.ViewDirectiveController = ViewDirectiveController;
    class ViewDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'A';
            this.template = '';
            this.scope.view = ngstd.BindingRestrict.TwoWay;
        }
    }
    ngstd.ViewDirective = ViewDirective;
    class MenuGroupController {
        constructor($element, $scope) {
            this.$element = $element;
            this.$scope = $scope;
            //use $scope to watch size change and work out height for view panel;
            this.element = $element;
            this.parent = $element.parent();
            this.view = $element.children('.view');
            this.title = $element.children('.title');
            $scope.$watch(() => this.parent.height(), (newValue, oldValue) => {
                this.view.height(this.element.innerHeight() - this.title.outerHeight() - 2);
            });
        }
    }
    MenuGroupController.$inject = ['$element', '$scope'];
    ngstd.MenuGroupController = MenuGroupController;
    class MenuGroupAlignmentColumn {
        constructor() {
            this.width = 0;
            this.height = 0;
            this.currentHeight = 0;
            this.alignElement = (elem) => {
                console.log(elem);
                console.log('clientSize: ' + elem.clientWidth + ', ' + elem.clientHeight);
                if (this.currentHeight == 0) {
                    //it must fit in even it is bigger than the view;
                    this.currentHeight = elem.clientHeight;
                    this.width = Math.max(elem.clientWidth, this.width);
                    return true;
                }
                else {
                    //it won't fit in if there is already something in the column;
                    if (this.currentHeight + elem.clientHeight > this.height) {
                        return false;
                    }
                    else {
                        this.currentHeight += elem.clientHeight;
                        this.width = Math.max(elem.clientWidth, this.width);
                        return true;
                    }
                }
            };
        }
    }
    ngstd.MenuGroupAlignmentColumn = MenuGroupAlignmentColumn;
    /**
     * This directive shall be used to automatically adjust tab group view panel height;
     */
    class MenuGroupDirective extends AngularDirective {
        constructor() {
            super();
            this.restrict = 'C';
            this.controller = MenuGroupController;
        }
    }
    ngstd.MenuGroupDirective = MenuGroupDirective;
    class DynamicTBodyDirective extends ngstd.AngularDirective {
        constructor($compile) {
            super();
            this.restrict = 'A';
            this.scope.items = BindingRestrict.TwoWay;
            this.scope.template = BindingRestrict.TwoWay;
            this.scope.controller = BindingRestrict.TwoWay;
            this.link = function (scope, element) {
                var childScope;
                scope.$watch('template', (nValue, oValue) => {
                    element.children().remove();
                    var template = '<tr ng-repeat="item in items">' + nValue + '</tr>';
                    if (childScope)
                        childScope.$destroy();
                    childScope = scope.$new();
                    var elem = $compile(template)(childScope);
                    element.append(elem);
                });
            };
        }
    }
    ngstd.DynamicTBodyDirective = DynamicTBodyDirective;
    class ImageEditorController {
        constructor($scope) {
            this.onImageChanged = (newValue) => {
                if (newValue) {
                    this.images = newValue.split(';').filter((value) => {
                        if (value)
                            return value.length > 0;
                        return false;
                    });
                }
                else {
                    this.images = [];
                }
            };
            this.removeImage = ($index) => {
                //console.log('$index: ' + $index);
                if (this.scope.multiple) {
                    var arr = this.scope.getImage().split(';').filter((value) => {
                        if (value)
                            return value.length > 0;
                        return false;
                    });
                    arr.splice($index, 1);
                    if (arr.length > 0) {
                        this.scope.setImage(arr.join(';') + ';');
                    }
                    else {
                        this.scope.setImage('');
                    }
                }
                else {
                    this.scope.setImage('');
                }
                //console.log(this.scope.image);
                //console.log(this.images);
            };
            this.imageUploaded = (image) => {
                //console.log('image uploaded: '+ image);
                if (this.scope.multiple) {
                    if (this.scope.getImage()) {
                        this.scope.setImage(this.scope.getImage() + image + ';');
                    }
                    else {
                        this.scope.setImage(image + ';');
                    }
                }
                else {
                    this.scope.setImage(image + ';');
                }
            };
            this.scope = $scope;
            //this watch will automatically generate the images from string, so the event handler only has to handle this 'image' string;
            //this.scope.$watch('image', this.onImageChanged );
            this.scope.imageChanged = this.onImageChanged;
        }
    }
    ImageEditorController.$inject = ['$scope'];
    ngstd.ImageEditorController = ImageEditorController;
    class ImageEditorDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            //this.scope.image = ngstd.BindingRestrict.Both;
            this.scope.multiple = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.uploadpath = ngstd.BindingRestrict.TwoWay;
            this.scope.width = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.height = ngstd.BindingRestrict.TwoWayOptional;
            this.require = 'ngModel';
            this.controllerAs = 'controller';
            this.template =
                '<div class="fileupload btn btn-default btn-xs menu" label="\'Upload\'" style="background-color: forestgreen; color: white;" accept="\'image/*\'" uploaded="controller.imageUploaded" message="message" path="uploadpath"></div>' +
                    '<div ng-repeat="image in controller.images track by $index" style="width: {{width}}px; height:{{height}}px; position: relative;">' +
                    '<img width="{{width}}" height="{{height}}" ng-src="{{image}}" />' +
                    '<div class="btn btn-danger btn-xs" ng-click="controller.removeImage($index)" style="width:30px;height:30px;padding:3px;position:absolute;right:0px;top:1px;">' +
                    '<svg width="24" height="24"><line x1="1.5" y1="1.5" x2="21.5" y2="21.5" stroke-width="3" stroke="black" ></line><line x1="1.5" y1="21.5" x2="21.5" y2="1.5" stroke-width="3" stroke="black"></line></svg>' +
                    '</div></div>';
            this.link = (scope, element, attributes, ngModel) => {
                if (!scope.width)
                    scope.width = 160;
                if (!scope.height)
                    scope.height = 160;
                if (!scope.multiple)
                    scope.multiple = false;
                scope.setImage = (value) => {
                    ngModel.$setViewValue(value);
                };
                scope.getImage = () => {
                    return ngModel.$viewValue;
                };
                scope.$watch(() => ngModel.$modelValue, (nValue, oValue) => {
                    //console.log('Image Editor model changed: ' + nValue);
                    scope.imageChanged(ngModel.$modelValue);
                });
                //ngModel.$viewChangeListeners.push(() => {
                //    console.log('view changed');
                //    if (scope.imageChanged) scope.imageChanged(ngModel.$viewValue);
                //});
            };
            this.controller = ImageEditorController;
        }
    }
    ngstd.ImageEditorDirective = ImageEditorDirective;
    //ImageSet Classes
    class ImageSet extends ngstd.NamedObject {
    }
    ngstd.ImageSet = ImageSet;
    //Table classes:
    class Table extends ngstd.NamedObject {
    }
    ngstd.Table = Table;
    class TableHeader extends ngstd.NamedObject {
    }
    ngstd.TableHeader = TableHeader;
    class TableHeadCell extends ngstd.NamedObject {
    }
    ngstd.TableHeadCell = TableHeadCell;
    class TableRow extends ngstd.NamedObject {
    }
    ngstd.TableRow = TableRow;
    //export interface SheetScope extends ng.IScope {
    //    data: ngstd.Table;
    //}
    //export class SheetDirectiveController {
    //    static $inject = ['$element', '$scope'];
    //    constructor(public $element: JQuery, public $scope: SheetScope) {
    //        $scope.controller = this;
    //    }
    //}
    class SheetDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.templateUrl = 'table.html';
            //'<table>' +
            //'<tr ng-repeat="row in ctrl.rows">' +
            //'<td ng-repeat="cell in row.cells">' +
            //'</td>' +
            //'</tr>' +
            //'</table>';
            this.scope.data = ngstd.BindingRestrict.TwoWay;
            //this.controller = SheetDirectiveController;
            //this.controllerAs = 'ctrl';
        }
    }
    ngstd.SheetDirective = SheetDirective;
    class PictureDirectiveController {
        constructor($http, $scope, $interval) {
            this.$http = $http;
            this.$scope = $scope;
            this.$interval = $interval;
            this.start = () => {
                if (this.invervalCall) {
                    this.interval.cancel(this.invervalCall);
                    this.invervalCall = null;
                }
                this.index = 0;
                if (this.scope.data)
                    if (this.scope.data.length > this.index) {
                        this.scope.link = this.scope.data[this.index];
                        this.index += 1;
                        if (this.scope.data.length <= this.index)
                            this.index = 0;
                    }
                this.invervalCall = this.interval(() => { this.next(); }, this.scope.interval);
            };
            this.count = 0;
            this.index = 0;
            this.next = () => {
                this.count += 1;
                if (this.scope.data)
                    if (this.scope.data.length > this.index) {
                        this.scope.link = this.scope.data[this.index];
                        this.index += 1;
                        if (this.scope.data.length <= this.index)
                            this.index = 0;
                    }
            };
            this.scope = $scope;
            this.interval = $interval;
            //watch for changes of data;
            $scope.$watch(() => $scope.data, (newValue, oldValue) => {
                this.start();
            });
            $scope.$watch(() => $scope.interval, (newValue, oldValue) => {
                this.start();
            });
            $scope.$on('$destroy', () => {
                console.log('picture interval destroyed!');
                if (this.invervalCall) {
                    this.interval.cancel(this.invervalCall);
                    this.invervalCall = null;
                }
            });
        }
    }
    PictureDirectiveController.$inject = ["$http", "$scope", "$interval"];
    ngstd.PictureDirectiveController = PictureDirectiveController;
    class PictureDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.template = '<img ng-src="{{link}}" width="{{width}}" height="{{height}}"/>';
            this.scope.data = ngstd.BindingRestrict.TwoWay;
            this.scope.width = ngstd.BindingRestrict.In;
            this.scope.height = ngstd.BindingRestrict.In;
            this.scope.interval = ngstd.BindingRestrict.In;
            this.controller = PictureDirectiveController;
        }
    }
    ngstd.PictureDirective = PictureDirective;
    class Num2StrModelConversionDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'A';
            this.template = null;
            this.require = 'ngModel';
            this.scope = null;
            this.link = (scope, element, attributes, ngModel) => {
                //Add parsers to ngModel;
                ngModel.$formatters.push((value) => {
                    if (!value)
                        return '0';
                    return value.toString();
                });
                ngModel.$parsers.push((value) => {
                    if (!value)
                        return 0;
                    if (isNaN(Number(value)))
                        return 0;
                    return Number(value);
                });
            };
        }
    }
    ngstd.Num2StrModelConversionDirective = Num2StrModelConversionDirective;
    class TinyInt2BoolModelConverstionDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'A';
            this.template = null;
            this.require = 'ngModel';
            this.scope = null;
            this.link = (scope, element, attributes, ngModel) => {
                //Add parsers to ngModel;
                ngModel.$formatters.push((value) => {
                    if (!value)
                        return false;
                    if (isNaN(value))
                        return false;
                    if (value != 0)
                        return true;
                    return false;
                });
                ngModel.$parsers.push((value) => {
                    if (value) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });
            };
        }
    }
    ngstd.TinyInt2BoolModelConverstionDirective = TinyInt2BoolModelConverstionDirective;
    class OpenFileDirective extends ngstd.AngularDirective {
        constructor($compile) {
            super();
            this.restrict = 'A';
            this.template = null; //'{{label}}<input type= "file" accept="{{accept}}"/>'; //class = fileinputs
            this.scope.accept = ngstd.BindingRestrict.TwoWay;
            this.require = 'ngModel';
            this.link = (scope, element, attributes, ngModel) => {
                //instead of using template, we here only use the $compile service to compile code into element and append it into the parent div.
                var input = $compile('<input type= "file" accept="{{accept}}"/>')(scope);
                element.append(input);
                var file = input[0];
                file.onchange = () => {
                    ngModel.$setViewValue(file.files);
                    file.value = null;
                };
            };
        }
    }
    ngstd.OpenFileDirective = OpenFileDirective;
    /**
     * attribute directive that should be applied on empty div element;
     */
    class TimeDirective extends ngstd.AngularDirective {
        constructor($compile) {
            super();
            this.restrict = 'A';
            this.template = null;
            this.require = 'ngModel';
            this.link = (scope, element, attributes, ngModel) => {
                //instead of using template, we here only use the $compile service to compile code into element and append it into the parent div.
                var input = $compile('<input ng-model="hours" size="2" ng-change="hoursChanged()" type="text"/>:<input ng-model="minutes" size="2" ng-change="minutesChanged()" type="text"/>:<input ng-model="seconds" size="2" ng-change="secondsChanged()" type="text"/>')(scope);
                element.append(input);
                var changed = () => {
                    var h = Number(scope.hours);
                    if (isNaN(h))
                        h = 0;
                    var m = Number(scope.minutes);
                    if (isNaN(m))
                        m = 0;
                    var s = Number(scope.seconds);
                    if (isNaN(s))
                        s = 0;
                    var mmt = moment().year(1).month(0).date(1).hour(h).minute(m).second(s);
                    ngModel.$setViewValue(mmt.toDate());
                };
                scope.hoursChanged = changed;
                scope.minutesChanged = changed;
                scope.secondsChanged = changed;
                var hour = input[0];
                var minute = input[2];
                var second = input[4];
                //console.log('time viewValue: ' + ngModel.$viewValue.toString());
                var init = ngModel.$viewValue ? moment(ngModel.$viewValue) : moment();
                scope.$watch(() => ngModel.$viewValue, (nValue, oValue) => {
                    //console.log('time ngModel $viewValue changed.');
                    //console.log(nValue);
                    var mmt = moment(nValue);
                    scope.hours = mmt.hours().toString();
                    scope.minutes = mmt.minutes().toString();
                    scope.seconds = mmt.seconds().toString();
                });
                var value;
                value = init.hours();
                scope.hours = isNaN(value) ? '0' : value.toString();
                value = init.minutes();
                scope.minutes = isNaN(value) ? '0' : value.toString();
                value = init.seconds();
                scope.seconds = isNaN(value) ? '0' : value.toString();
                var focused = (e) => {
                    var input = e.target;
                    input.selectionStart = 0;
                    input.selectionEnd = input.value.length;
                };
                hour.onfocus = focused;
                minute.onfocus = focused;
                second.onfocus = focused;
                hour.onwheel = (e) => {
                    var value = Number(scope.hours);
                    if (isNaN(value))
                        value = 0;
                    value += Math.round(e.deltaY / 100);
                    value = value % 24;
                    if (value < 0)
                        value += 24;
                    scope.hours = value.toString();
                    e.preventDefault();
                    changed();
                    scope.$apply();
                };
                hour.onkeydown = (e) => {
                    switch (e.keyCode) {
                        case 9:
                        case 16:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                        case 96:
                        case 97:
                        case 98:
                        case 99:
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                            break;
                        case 8:
                            break;
                        case 46:
                            break;
                        case 39:
                        case 37:
                            break;
                        case 38:
                            var value = Number(scope.hours);
                            if (isNaN(value))
                                value = 0;
                            value += 1;
                            value = value % 24;
                            if (value < 0)
                                value += 24;
                            scope.hours = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        case 40:
                            var value = Number(scope.hours);
                            if (isNaN(value))
                                value = 0;
                            value -= 1;
                            value = value % 24;
                            if (value < 0)
                                value += 24;
                            scope.hours = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        default:
                            e.preventDefault();
                            break;
                    }
                };
                minute.onwheel = (e) => {
                    var value = Number(scope.minutes);
                    if (isNaN(value))
                        value = 0;
                    value += Math.round(e.deltaY / 100);
                    value = value % 60;
                    if (value < 0)
                        value += 60;
                    scope.minutes = value.toString();
                    e.preventDefault();
                    changed();
                    scope.$apply();
                };
                minute.onkeydown = (e) => {
                    switch (e.keyCode) {
                        case 9:
                        case 16:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                        case 96:
                        case 97:
                        case 98:
                        case 99:
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                            break;
                        case 8:
                            break;
                        case 46:
                            break;
                        case 39:
                        case 37:
                            break;
                        case 38:
                            var value = Number(scope.minutes);
                            if (isNaN(value))
                                value = 0;
                            value += 1;
                            value = value % 60;
                            if (value < 0)
                                value += 60;
                            scope.minutes = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        case 40:
                            var value = Number(scope.minutes);
                            if (isNaN(value))
                                value = 0;
                            value -= 1;
                            value = value % 60;
                            if (value < 0)
                                value += 60;
                            scope.minutes = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        default:
                            e.preventDefault();
                            break;
                    }
                };
                second.onwheel = (e) => {
                    var value = Number(scope.seconds);
                    if (isNaN(value))
                        value = 0;
                    value += Math.round(e.deltaY / 100);
                    value = value % 60;
                    if (value < 0)
                        value += 60;
                    scope.seconds = value.toString();
                    e.preventDefault();
                    changed();
                    scope.$apply();
                };
                second.onkeydown = (e) => {
                    switch (e.keyCode) {
                        case 9:
                        case 16:
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57:
                        case 96:
                        case 97:
                        case 98:
                        case 99:
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                            break;
                        case 8:
                            break;
                        case 46:
                            break;
                        case 39:
                        case 37:
                            break;
                        case 38:
                            var value = Number(scope.seconds);
                            if (isNaN(value))
                                value = 0;
                            value += 1;
                            value = value % 60;
                            if (value < 0)
                                value += 60;
                            scope.seconds = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        case 40:
                            var value = Number(scope.seconds);
                            if (isNaN(value))
                                value = 0;
                            value -= 1;
                            value = value % 60;
                            if (value < 0)
                                value += 60;
                            scope.seconds = value.toString();
                            e.preventDefault();
                            changed();
                            scope.$apply();
                            break;
                        default:
                            e.preventDefault();
                            break;
                    }
                };
            };
        }
    }
    ngstd.TimeDirective = TimeDirective;
    class DateTimeDirective extends ngstd.AngularDirective {
        constructor($compile) {
            super();
            this.restrict = 'A';
            this.template = null;
            this.require = 'ngModel';
            this.link = (scope, element, attributes, ngModel) => {
                //instead of using template, we here only use the $compile service to compile code into element and append it into the parent div.
                var input = $compile('<md-datepicker ng-model="date" ng-change="dateChanged()"></md-datepicker><div time ng-model="time" ng-change="timeChanged()"></div>')(scope);
                element.append(input);
                var init = ngModel.$viewValue ? moment(ngModel.$viewValue) : moment();
                scope.date = init.toDate();
                scope.time = init.toDate();
                scope.dateChanged = () => {
                    var mmtDate = moment(scope.date);
                    var mmtTime = moment(scope.time);
                    var mmt = moment().year(mmtDate.year()).month(mmtDate.month()).date(mmtDate.date()).hour(mmtTime.hours()).minute(mmtTime.minutes()).second(mmtTime.seconds());
                    ngModel.$setViewValue(mmt.toDate());
                };
                scope.timeChanged = () => {
                    var mmtDate = moment(scope.date);
                    var mmtTime = moment(scope.time);
                    var mmt = moment().year(mmtDate.year()).month(mmtDate.month()).date(mmtDate.date()).hour(mmtTime.hours()).minute(mmtTime.minutes()).second(mmtTime.seconds());
                    ngModel.$setViewValue(mmt.toDate());
                };
                scope.$watch(() => ngModel.$viewValue, (nValue, oValue) => {
                    var mmt = moment(nValue);
                    scope.date = mmt.toDate();
                    scope.time = mmt.toDate();
                });
            };
        }
    }
    ngstd.DateTimeDirective = DateTimeDirective;
    //menu 
    class TabControl extends NamedObject {
        constructor() {
            super(...arguments);
            this.items = [];
            this.addTabItem = (item) => {
                this.items.push(item);
                item.parent = this;
                return item;
            };
        }
        selectTab(item) {
            this.items.forEach((value, index, array) => {
                if (value === item) {
                    value.style = "'tab-pane active'";
                    this.selectedContent = item.content;
                }
                else {
                    value.style = "";
                }
            });
        }
    }
    ngstd.TabControl = TabControl;
    class TabItem extends NamedObject {
        select() {
            if (this.parent)
                this.parent.selectTab(this);
        }
        ;
    }
    ngstd.TabItem = TabItem;
    class TabContent extends NamedObject {
        constructor() {
            super(...arguments);
            this.groups = [];
            this.addGroup = (item) => {
                this.groups.push(item);
            };
        }
    }
    ngstd.TabContent = TabContent;
    class MenuGroup extends NamedObject {
        constructor() {
            super(...arguments);
            this.width = 'auto';
            this.items = [];
            this.addItem = (item) => {
                this.items.push(item);
            };
        }
    }
    ngstd.MenuGroup = MenuGroup;
    class MenuItem extends NamedObject {
    }
    ngstd.MenuItem = MenuItem;
    class FileMenuItem extends NamedObject {
    }
    ngstd.FileMenuItem = FileMenuItem;
    class ImageSlideController {
        constructor($element, $scope, $interval) {
            this.$element = $element;
            this.$scope = $scope;
            this.$interval = $interval;
            this.$inject = ['$element', '$scope', '$interval'];
            var host = $element.children('div');
            var divs = host.children('div');
            var div1 = jQuery(divs[0]);
            var div2 = jQuery(divs[1]);
            var countDown = 0;
            var index = 0;
            var mode = true;
            var getNextImage = () => {
                index += 1;
                if (index >= $scope.images.length)
                    index = 0;
                if ($scope.images.length == 0)
                    return '';
                return $scope.images[index];
            };
            if ($scope.images.length > 0) {
                $scope.img1 = $scope.images[0];
                $scope.img2 = getNextImage();
            }
            //var watch = $scope.$watch(() => host.width(), (newValue: number, oldValue: number) => {
            //    //div1.width(newValue+'px');
            //    div2.width(newValue+'px');
            //});
            var int = $interval(() => {
                countDown += 1;
                var interval = Number($scope.interval);
                var transition = Number($scope.transition);
                if (countDown >= (interval + transition)) {
                    console.log('greater');
                    countDown = 0;
                    mode = !mode;
                    if (mode) {
                        $scope.img2 = getNextImage();
                    }
                    else {
                        $scope.img1 = getNextImage();
                    }
                }
                //if (countDown == 0) {
                //    console.log(div1);
                //    console.log(div2);
                //    if (mode) {
                //        //console.log('true div1 set to 0%');
                //        div1.css('left', '0%');
                //        div2.css('left', '101%');
                //        $scope.img2 = getNextImage();
                //    }
                //    else {
                //        //console.log('false div2 set to 0%');
                //        div2.css('left', '0%');
                //        div1.css('left', '101%');
                //        $scope.img1 = getNextImage();
                //    }
                //}
                if (countDown > interval) {
                    var value = Math.round(-((countDown - interval) / transition) * 100);
                    if (mode) {
                        //console.log('true div1: ' + value);
                        //console.log('true div2: ' + (100+value));
                        //div1.css('left', value.toString() + '%');
                        //div2.css('left', (100 + value).toString() + '%');
                        div1.fadeOut(transition * 25);
                        div2.fadeIn(transition * 25);
                    }
                    else {
                        //console.log('false div1: ' + (100 + value));
                        //console.log('false div2: ' + value);
                        //div2.css('left', value.toString() + '%');
                        //div1.css('left', (100 + value).toString() + '%');
                        div2.fadeOut(transition * 25);
                        div1.fadeIn(transition * 25);
                    }
                }
                //console.log('div1 left:'+ div1.css('left'));
                //console.log('div2 left:'+div2.css('left'));
                //console.log(interval + transition);
                //console.log(countDown);
            }, 50);
            $scope.$on('$destroy', (event) => {
                if (angular.isDefined(int))
                    $interval.cancel(int);
            });
        }
    }
    ngstd.ImageSlideController = ImageSlideController;
    class ImageSlideDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.templateUrl = 'ImageSlide.html';
            this.scope.images = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.interval = ngstd.BindingRestrict.In;
            this.scope.transition = ngstd.BindingRestrict.In;
            this.controller = ImageSlideController;
        }
    }
    ngstd.ImageSlideDirective = ImageSlideDirective;
    class CaptchaController {
        constructor($http, $scope, $element) {
            this.refresh = () => {
                this.link = 'captcha.php?rand=' + Math.random() * 1000;
            };
            this.codeLoaded = (e) => {
                if (this.scope.changed)
                    this.scope.changed();
            };
            this.scope = $scope;
            $scope.refresh = this.refresh;
            var img = $element.children('img');
            img.on('load', this.codeLoaded);
            this.refresh();
        }
    }
    CaptchaController.$inject = ['$http', '$scope', '$element'];
    ngstd.CaptchaController = CaptchaController;
    class CaptchaDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'E';
            this.template = '<img ng-src="{{cap.link}}">';
            this.scope.refresh = ngstd.BindingRestrict.TwoWay;
            this.scope.changed = ngstd.BindingRestrict.TwoWayOptional;
            this.controller = CaptchaController;
            this.controllerAs = 'cap';
        }
    }
    ngstd.CaptchaDirective = CaptchaDirective;
    class FileUploadInfo {
    }
    ngstd.FileUploadInfo = FileUploadInfo;
    class FileUploadController {
        constructor($http, $scope, $element) {
            this.$inject = ['$http', '$scope', '$element'];
            this.uploadFile = () => {
                if (this.file.files.length == 0)
                    return;
                var inputFile = this.file.files[0];
                if (this.scope.sizeLimit) {
                    if (inputFile.size > this.scope.sizeLimit) {
                        var _limit = '';
                        if (this.scope.sizeLimit > 1024 * 1024) {
                            _limit = Math.round(this.scope.sizeLimit / 1024 / 1024) + "MB";
                        }
                        else {
                            if (this.scope.sizeLimit > 1024) {
                                _limit = Math.round(this.scope.sizeLimit / 1024) + "KB";
                            }
                            else {
                                _limit = Math.round(this.scope.sizeLimit) + "B";
                            }
                        }
                        this.scope.message = "File must be smaller than " + _limit + ".";
                        return;
                    }
                }
                var data = new FormData();
                data.append('file', inputFile);
                data.append('path', this.scope.path);
                this.scope.disabled = true;
                this.scope.message = 'Uploading...';
                //console.log(data);
                this.http.post('fileupload.php', data, {
                    withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                })
                    .success(this.uploadSuccess)
                    .error(this.uploadError);
                //console.log('input type:file value = ' + this.file.value);
                this.file.value = null;
            };
            this.uploadSuccess = (data) => {
                //console.log(data);
                this.scope.disabled = false;
                this.scope.message = 'Uploaded';
                this.scope.filename = data.filename;
                if (this.scope.uploaded) {
                    this.scope.uploaded(data.filename, this.scope.context);
                }
            };
            this.uploadError = (data) => {
                console.log(data);
            };
            this.http = $http;
            this.scope = $scope;
            this.element = $element;
            this.file = ($element.children("input")[0]);
            this.file.onchange = this.uploadFile;
        }
    }
    ngstd.FileUploadController = FileUploadController;
    class FileUploadDirective extends ngstd.AngularDirective {
        constructor() {
            super();
            this.restrict = 'C';
            this.template = '{{label}}<input type= "file" accept="{{accept}}"/>'; //class="fileinputs"
            this.scope.filename = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.sizeLimit = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.href = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.message = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.disabled = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.path = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.uploaded = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.label = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.accept = ngstd.BindingRestrict.TwoWayOptional;
            this.scope.context = ngstd.BindingRestrict.TwoWayOptional;
            this.require = 'ngModel';
            this.controller = FileUploadController;
        }
    }
    ngstd.FileUploadDirective = FileUploadDirective;
})(ngstd || (ngstd = {}));
/**
 * PHPPostObj is used to post command to the php service; It is used by the rpc.html and php.html;
 */
class PHPPostObj {
    constructor() {
        this.value = [];
    }
}
/**
 * FileBuilder is the interface to make php service to create/write specific file on the server side; It is used by rpc.html and php.html;
 */
class FileBuiler {
}
/**
 * CompilerInclude defines patterns required by RPC and PHP compiler;
 */
class CompilerPattern {
}
CompilerPattern.ptnRPCInclude = /\/\/rpc(\s+include\s+(('[\w\d]+'\s*)*)|)\s*/ig;
CompilerPattern.ptnIncludeFile = /'([\w\-]+)'/ig;
CompilerPattern.ptnPHPInclude = /\/\/php(\s+include\s+(('[\w\d]+'\s*)*)|)\s*/ig;
CompilerPattern.ptnService = /(^|\n)\s*(export\s+|)(interface|class)\s+(\w+)\s*\{/g;
/**
 * The standard pattern libraries for analyzing typescript entities;
 */
class StdPatterns {
}
StdPatterns.ptnModule = /(^|\n)\s*module\s+(\w+)\s*\{/g;
StdPatterns.ptnClass = /(^|\n)\s*(export\s+|)class\s+(\w+)\s*\{/g;
StdPatterns.ptnInterface = /(^|\n)\s*(export\s+|)interface\s+(\w+)\s*\{/g;
StdPatterns.ptnInterfaceMethod = /([\w][\w\d\.]*)\s*\(((\s*([\w][\w\d\.]*)\s*\:\s*([\w][\w\d\.]*)(|\s*\[\s*\])\s*(|\,))*)\)\s*\:\s*(([\w][\w\d\.]*)(\s*\[\s*\]|))/g;
StdPatterns.ptnParameter = /\s*([\w][\w\d\.]*)\s*\:\s*(([\w][\w\d\.]*)\s*(\[\s*\]|))/g;
class CancelBeforeTimeout {
    constructor($timeout, $interval, $call) {
        this.trigger = (...args) => {
            this.timeout.cancel(this.promise);
            this.promise = this.timeout(this.call, this.interval, false, args);
            //this.lastTriggerTime = Date.now();
        };
        this.timeout = $timeout;
        this.interval = $interval;
        this.call = $call;
    }
}
class DecimalNumber {
    constructor(value) {
        this.add = (value) => {
            var min = Math.min(value.minIndex, this.minIndex);
            var max = Math.max(value.maxIndex, this.maxIndex);
            var res = new DecimalNumber();
            res.minIndex = min;
            res.maxIndex = max;
            for (var i = min; i <= max; i++) {
                res.digits[i] = (value.positive ? 1 : -1) * (value.digits[i] ? value.digits[i] : 0) +
                    (this.positive ? 1 : -1) * (this.digits[i] ? this.digits[i] : 0);
            }
            res.cleanDigits();
            return res;
        };
        this.subtract = (value) => {
            var min = Math.min(value.minIndex, this.minIndex);
            var max = Math.max(value.maxIndex, this.maxIndex);
            var res = new DecimalNumber();
            res.minIndex = min;
            res.maxIndex = max;
            for (var i = min; i <= max; i++) {
                res.digits[i] = (value.positive ? -1 : 1) * (value.digits[i] ? value.digits[i] : 0) +
                    (this.positive ? 1 : -1) * (this.digits[i] ? this.digits[i] : 0);
            }
            res.cleanDigits();
            return res;
        };
        this.multiply = (value) => {
            var decimalValue = new DecimalNumber(value);
            var res = new DecimalNumber();
            res.minIndex = this.minIndex + decimalValue.minIndex;
            res.maxIndex = this.maxIndex + decimalValue.maxIndex;
            for (var i = this.minIndex; i <= this.maxIndex; i++) {
                for (var j = decimalValue.minIndex; j <= decimalValue.maxIndex; j++) {
                    if (!res.digits[i + j])
                        res.digits[i + j] = 0;
                    res.digits[i + j] += (decimalValue.positive ? 1 : -1) * (decimalValue.digits[j] ? decimalValue.digits[j] : 0) *
                        (this.positive ? 1 : -1) * (this.digits[i] ? this.digits[i] : 0);
                }
            }
            res.cleanDigits();
            return res;
        };
        this.times = (value) => {
            if (!value)
                value = 0;
            var min = this.minIndex;
            var max = this.maxIndex;
            var res = new DecimalNumber();
            res.minIndex = min;
            res.maxIndex = max;
            for (var i = min; i <= max; i++) {
                res.digits[i] = (this.positive ? value : -value) * (this.digits[i] ? this.digits[i] : 0);
            }
            res.cleanDigits();
            return res;
        };
        this.divide = (value, accuracy) => {
            //default accuracy is 6 digits;
            var decimalValue = new DecimalNumber(1 / (new DecimalNumber(value)).toNumber());
            decimalValue.dropDigitsAfter(accuracy);
            return this.multiply(decimalValue);
        };
        this.divideby = (value, accuracy) => {
            //default accuracy is 6 digits;
            var divider = new DecimalNumber(value);
            var res = new DecimalNumber();
            //res.positive = this.positive ? divider.positive : !divider.positive;
            accuracy = Math.abs(DecimalNumber.validateNumber(accuracy, 6));
            var dec = this.clone();
            if (!divider.positive) {
                dec.positive = !dec.positive;
                divider.positive = true;
            }
            var dec2sci = (dValue) => {
                var foundFirst = false;
                var values = [];
                //if (!dValue.positive) values.push('-');
                for (var i = dValue.maxIndex; i >= dValue.minIndex; i--) {
                    if (foundFirst) {
                        values.push(dValue.digits[i] ? dValue.digits[i].toString() : '0');
                    }
                    else {
                        if (dValue.digits[i])
                            if (dValue.digits[i] != 0) {
                                values.push(dValue.digits[i].toString(), '.');
                                foundFirst = true;
                            }
                    }
                }
                return Number(values.join(''));
            };
            var subtracttimes = (host, base, multiplier) => {
                var remover = base.multiply(multiplier);
                //console.log('      host: ' + host.toString());
                //console.log('      base: ' + base.toString());
                //console.log('multiplier: ' + multiplier.toString());
                //console.log('   remover: ' + remover.toString());
                return host.subtract(remover);
            };
            var whilecount = 0;
            while (res.minIndex > -accuracy) {
                var sDec = dec2sci(dec);
                var sDiv = dec2sci(divider);
                var times = new DecimalNumber(sDec / sDiv);
                //console.log('times: ' + times.toString());
                //console.log('real max diff: ' + (dec.realMaxIndex - divider.realMaxIndex).toString());
                //console.log('dec before: ' + dec.toString());
                var multipler = times.digitOffset(dec.realMaxIndex - divider.realMaxIndex);
                multipler.keepDigitsOf(6);
                multipler.positive = dec.positive;
                //console.log('multipler: ' + multipler.toString());
                dec = subtracttimes(dec, divider, multipler);
                //console.log('dec after: ' + dec.toString());
                res = res.subtract(multipler);
                //console.log('current res: ' + res.toString());
                whilecount += 1;
                //console.log('res.minIndex: ' + res.minIndex.toString());
                //console.log('----------------------------');
                if (dec.isZero)
                    break;
                if (whilecount > DecimalNumber.dividingLimit)
                    break;
            }
            return res;
        };
        this.digitOffset = (value) => {
            value = DecimalNumber.validateNumber(value, 0);
            var dec = new DecimalNumber();
            for (var i = this.minIndex; i <= this.maxIndex; i++) {
                dec.digits[i + value] = this.digits[i];
            }
            dec.maxIndex = this.maxIndex + value;
            dec.minIndex = this.minIndex + value;
            dec.positive = this.positive;
            return dec;
        };
        this.clone = () => {
            var dec = new DecimalNumber();
            dec.minIndex = this.minIndex;
            dec.maxIndex = this.maxIndex;
            dec.positive = this.positive;
            for (var i = this.minIndex; i <= this.maxIndex; i++) {
                dec.digits[i] = this.digits[i];
            }
            return dec;
        };
        this.dropDigitsAfter = (accuracy) => {
            accuracy = Math.abs(DecimalNumber.validateNumber(accuracy, 6));
            for (var i = -accuracy - 1; i >= this.minIndex; i--) {
                this.digits[i] = undefined;
            }
            this.minIndex = -accuracy;
        };
        this.keepDigitsOf = (accuracy) => {
            accuracy = Math.abs(DecimalNumber.validateNumber(accuracy, 6));
            for (var i = this.maxIndex - accuracy - 1; i >= this.minIndex; i--) {
                this.digits[i] = undefined;
            }
            this.minIndex = this.maxIndex - accuracy;
        };
        this.cleanDigits = () => {
            var index = this.minIndex;
            var forNext = 0;
            var whilecount = 0;
            while (index <= this.maxIndex || forNext != 0) {
                if (!this.digits[index])
                    this.digits[index] = 0;
                //console.log(index.toString() + ' before: ' + this.digits[index].toString());
                this.digits[index] += forNext;
                forNext = 0;
                if (this.digits[index] > 9) {
                    forNext = (this.digits[index] - (this.digits[index] % 10)) / 10;
                    this.digits[index] = this.digits[index] % 10;
                }
                if (this.digits[index] < -9) {
                    forNext = (this.digits[index] + ((-this.digits[index]) % 10)) / 10;
                    this.digits[index] = this.digits[index] % 10;
                }
                //console.log(index.toString() + ' after: ' + this.digits[index].toString());
                //console.log(index.toString() + ' forNext: ' + forNext.toString());
                index += 1;
                whilecount += 1;
            }
            //console.log(this.toListString());
            if (this.maxIndex < index)
                this.maxIndex = index;
            whilecount = 0;
            //work out positive or negative;
            for (var i = this.maxIndex; i >= this.minIndex; i--) {
                if (!this.digits[i])
                    this.digits[i] = 0;
                if (this.digits[i] != 0) {
                    if (this.digits[i] > 0) {
                        this.positive = true;
                    }
                    else {
                        this.positive = false;
                    }
                    break;
                }
            }
            //turn to positive
            if (!this.positive) {
                for (var i = this.maxIndex; i >= this.minIndex; i--) {
                    this.digits[i] = -this.digits[i];
                }
            }
            //clean negatives
            forNext = 0;
            for (var i = this.minIndex; i <= this.maxIndex; i++) {
                this.digits[i] += forNext;
                forNext = 0;
                if (this.digits[i] < 0) {
                    this.digits[i] += 10;
                    forNext = -1;
                }
            }
            //clear zeros;
            while ((!this.digits[this.maxIndex] || this.digits[this.maxIndex] == 0) && this.maxIndex > 0) {
                this.digits[this.maxIndex] = undefined;
                this.maxIndex -= 1;
            }
            while ((!this.digits[this.minIndex] || this.digits[this.minIndex] == 0) && this.minIndex < 0) {
                this.digits[this.minIndex] = undefined;
                this.minIndex += 1;
            }
        };
        this.toString = () => {
            var builder = [];
            for (var i = Math.max(0, this.maxIndex); i >= this.minIndex; i--) {
                builder.push(this.digits[i] ? this.digits[i].toString() : '0');
                if (i == 0)
                    builder.push('.');
            }
            return (this.positive ? '' : '-') + builder.join('');
        };
        this.toNumber = () => {
            return Number(this.toString());
        };
        this.toDecimal = (accuracy) => {
            accuracy = Math.abs(Math.round(accuracy));
            var builder = [];
            for (var i = Math.max(0, this.maxIndex); i >= (-accuracy); i--) {
                builder.push(this.digits[i] ? this.digits[i].toString() : '0');
                if (i == 0)
                    builder.push('.');
            }
            return (this.positive ? '' : '-') + builder.join('');
        };
        this.toListString = () => {
            var builder = [];
            for (var i = this.maxIndex; i >= this.minIndex; i--) {
                builder.push(this.digits[i] ? this.digits[i].toString() : '0');
                if (i == 0)
                    builder.push('.');
            }
            return (this.positive ? '' : '-') + builder.join(' ');
        };
        var stringValue;
        if (value) {
            switch (typeof value) {
                case 'string':
                    //console.log('string');
                    stringValue = value.toString();
                    break;
                case 'number':
                    //console.log('number' + value.toString());
                    stringValue = value.toString();
                    break;
                case 'boolean':
                    stringValue = value ? '1' : '-1';
                    break;
                case 'object':
                    var dec = value;
                    var minKey = 0;
                    var maxKey = 0;
                    if (dec.digits)
                        if (Array.isArray(dec.digits)) {
                            this.digits = [];
                            for (var key in dec.digits) {
                                if (!isNaN(Number(key))) {
                                    var _key = Math.round(Number(key));
                                    if (_key < minKey)
                                        minKey = _key;
                                    if (_key > maxKey)
                                        maxKey = _key;
                                    this.digits[_key] = 0;
                                    if (dec.digits[key])
                                        if (!isNaN(Number(dec.digits[key]))) {
                                            this.digits[_key] = Number(dec.digits[key]);
                                        }
                                }
                            }
                            this.minIndex = minKey;
                            this.maxIndex = maxKey;
                            this.positive = true;
                            this.cleanDigits();
                            return; //can stop here as we have parsed the object;
                        }
                        else {
                            stringValue = '0';
                        }
                    break;
                default:
                    stringValue = '0';
                    break;
            }
        }
        else {
            stringValue = '0';
        }
        if (stringValue) {
            //console.log(stringValue);
            var stringValue = DecimalNumber.formatter(stringValue);
            if (stringValue.indexOf('-') == 0) {
                this.positive = false;
                stringValue = stringValue.substr(1);
            }
            else {
                this.positive = true;
            }
            var dotIndex = stringValue.indexOf('.');
            this.digits = [];
            if (dotIndex == -1) {
                this.maxIndex = stringValue.length - 1;
                this.minIndex = 0;
                for (var i = 0; i < stringValue.length; i++) {
                    this.digits[stringValue.length - i - 1] = Number(stringValue.charAt(i));
                }
            }
            else {
                this.maxIndex = dotIndex - 1;
                this.minIndex = dotIndex - stringValue.length + 1;
                for (var i = 0; i < dotIndex; i++) {
                    this.digits[dotIndex - i - 1] = Number(stringValue.charAt(i));
                }
                for (var i = dotIndex + 1; i < stringValue.length; i++) {
                    this.digits[dotIndex - i] = Number(stringValue.charAt(i));
                }
            }
        }
        else {
            this.digits = [];
            this.minIndex = 0;
            this.maxIndex = 0;
            this.positive = true;
        }
    }
    static formatter(value) {
        var hasNegative = value.indexOf('-') > -1;
        var firstDot = value.indexOf('.');
        if (firstDot > -1) {
            var int = value.substr(0, firstDot).replace(/\D/g, '');
            var dcm = value.substr(firstDot + 1).replace(/\D/g, '');
            dcm = dcm.replace(/0+$/, '');
            value = int + '.' + dcm;
        }
        else {
            value = value.replace(/\D/g, '');
        }
        value = value.replace(/^0+/, '');
        firstDot = value.indexOf('.');
        if (firstDot == 0)
            value = '0' + value;
        return hasNegative ? '-' + value : value;
    }
    get isZero() {
        for (var i = this.maxIndex; i >= this.minIndex; i--) {
            if (this.digits[i])
                if (this.digits[i] != 0) {
                    return false;
                }
        }
        return true;
    }
    get realMaxIndex() {
        for (var i = this.maxIndex; i >= this.minIndex; i--) {
            if (this.digits[i])
                if (this.digits[i] != 0) {
                    return i;
                }
        }
        console.log('getting minIndex: ' + this.minIndex.toString() + ' while maxIndex: ' + this.maxIndex.toString());
        return this.minIndex;
    }
    static validateNumber(value, defalutValue) {
        if (!defalutValue)
            defalutValue = 0;
        if (value) {
            switch (typeof value) {
                case 'number':
                    value = Math.round(value);
                    break;
                case 'string':
                    var sNumber = Number(value);
                    if (isNaN) {
                        value = sNumber;
                    }
                    else {
                        value = defalutValue;
                    }
                    break;
                default:
                    value = defalutValue;
                    break;
            }
        }
        else {
            value = defalutValue;
        }
        return value;
    }
}
DecimalNumber.dividingLimit = 100;
class FieldViews {
    static BuildView(view, model, placeholder, attributes) {
        var builder = [];
        switch (view) {
            case FieldViews.Input_Number_Readonly:
                builder.push('<input type="number" class="form-control" ng-readonly="true" ng-model="', model, '" placeholder="', placeholder, '" ', attributes, '/>');
                break;
            case FieldViews.Input_Number:
                builder.push('<input type="number" class="form-control" ng-model="', model, '" placeholder="', placeholder, '" ', attributes, '/>');
                break;
            case FieldViews.Input_Text:
                builder.push('<input type="text" class="form-control" ng-model="', model, '" placeholder="', placeholder, '" ', attributes, '/>');
                break;
            case FieldViews.Input_Text_Decimal:
                builder.push('<input type="text" decimal class="form-control" ng-model="', model, '" placeholder="', placeholder, '" ', attributes, '/>');
                break;
            case FieldViews.Input_Checkbox:
                builder.push('<label><input type="checkbox" class="form-control" ng-model="', model, '" ', attributes, ' bool2str/>', placeholder, '</label>');
                break;
            case FieldViews.TextArea:
                builder.push('<textarea class="form-control" ng-model="', model, '" placeholder="', placeholder, '" ', attributes, '></textarea>');
                break;
            case FieldViews.ImageMultiple:
                builder.push('<image-editor multiple="true" ng-model="', model, '" ', attributes, '></image-editor>');
                break;
            case FieldViews.ImageSingle:
                builder.push('<image-editor ng-model="', model, '" ', attributes, '></image-editor>');
                break;
            case FieldViews.Date:
                builder.push('<md-datepicker ng-model="', model, '" string2date md-placeholder="', placeholder, '" ', attributes, '></md-datepicker>');
                break;
            case FieldViews.Time:
                builder.push('<div time ng-model="', model, '" ', attributes, '></div>');
                break;
            case FieldViews.DateTime:
                //builder.push('{{', model, '}}');
                builder.push('<div datetime ng-model="', model, '" string2date ', attributes, '></div>');
                break;
        }
        return builder.join('');
    }
}
FieldViews.Input_Number_Readonly = 'input/number:readonly';
FieldViews.Input_Number = 'input/number';
FieldViews.Input_Text = 'input/text';
FieldViews.Input_Text_Decimal = 'input/text:decimal';
FieldViews.Input_Checkbox = 'input/checkbox';
FieldViews.TextArea = 'textarea';
FieldViews.ImageMultiple = 'image/multiple';
FieldViews.ImageSingle = 'image/single';
FieldViews.Date = 'date';
FieldViews.Time = 'time';
FieldViews.DateTime = 'datetime';
//# sourceMappingURL=ngstd.js.map