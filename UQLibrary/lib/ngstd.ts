module ngstd {
    var debugging: boolean = false;
    export function AngluarJSTemplateUrlPacker(url: string) {
        return url;
    }
    export interface INamed {
        TypeName: string;
        clone: (value: any) => any;
    }
    /**
     * the base class for types that can be used for model, where name of the type is important for selecting the template.
     */
    export class NamedObject implements INamed {
        get TypeName(): string {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((this).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        };
        clone(value: any) {
            for (var attr in value) {
                //console.log(this.TypeName + ".hasOwnProperty" + attr + " :" + this.hasOwnProperty(attr));
                if (attr != "TypeName" && value.hasOwnProperty(attr)) this[attr] = value[attr];
            }
        }
    }
 
    /**
     * A controller the provide standard viewmodel control
     */
    //export class StdController<TApp, TData, TModel> {
    //    static $inject = ['$scope'];
    //    constructor($scope: IStdScope<TApp, TData, TModel>) {
            
    //    }
    //}
    export interface IStdScope<TApp, TData, TModel, TParent> extends ng.IScope {
        app: TApp,
        data: TData,
        model: TModel,
        parent: TParent
    }
    export interface IPage {
        index: number;
        page: number;
    }
    /**
     * An implementation of Angular Module. A few important setting features are provided as standard functions.
     */
    export class AngularModule {
        app: ng.IModule;
        constructor(name: string, modules: Array<string>, configFn?: Function) {
            if (!modules) modules = [];
            this.app = angular.module(name, modules, configFn);
        }
        config(configFn?: Function) {
            this.app.config(configFn);
        }
        trustUrl(pattern: RegExp) {
            this.app.config(function ($compileProvider: ng.ICompileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(pattern);
            });
        }
        addController(controllerType: typeof AngularController) {
            //check if valid selector is provided.
            if (!controllerType.selector || typeof controllerType.selector != 'string') {
                console.error('Missing static selector field in type:', controllerType);
                throw 'Error: Missing static selector field in the AngularController type!';
            }
            this.app.controller(controllerType.selector, controllerType);
        }
        addControllerAsSelector(selector: string, controller: Function) {
            this.app.controller(selector, controller);
        }
        /**
         * Add a directive to the Angular Module;
         * @param name is the name of the directive
         * @param factory is the factory function such as ()=>new Directive(). Directive name won't work.
         */
        addInjectedDirective(name: string, factory: ng.IDirectiveFactory) {
            this.app.directive(name, factory);
        }
        addDirective(directiveType: typeof AngularDirective) {
            //check if valid selector is provided.
            if (!directiveType.selector || typeof directiveType.selector != 'string') {
                console.error('Missing static selector field in type:', directiveType);
                throw 'Error: Missing static selector field in the AngularDirective type!';
            }
            this.app.directive(directiveType.selector, () => new directiveType());
        }
        addStdDirective(name: string, templateUrl: string, Controller: Function) {
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
        addFactory(name: string, factory: Function) {
            this.app.factory(name, factory);
        }
        addService(name: string, service: Function) {
            this.app.service(name, service);
        }
        /**
         * include all member functions as filters into the current angular module;
         * @param filterObject a class with all filters defined as static methods;
         */
        includeFilters (filterObject: Object) {
            for (let key in filterObject) {
                this.app.filter(key,()=>filterObject[key]);
            }
        }
        /**
         * Provide access to the ng.IModule;
         */
        get Base(): ng.IModule {
            return this.app;
        }

        /**
         * enables html5 mode for using base<path> and location service;
         */
        public LocationHtml5Mode = () => {
            this.app.config(
                ['$locationProvider',
                    ($locationProvider: ng.ILocationProvider) => {
                        $locationProvider.html5Mode(true);
                    }
                ]
            );
        };
        /**
         * Include Content Directive in this module;
         */
        public includeContentDirective = () => {
            this.addInjectedDirective('content', () => new ContentDirective());
        };
        public includeLoaderController(name?:string) {
            this.addControllerAsSelector(name ? name : 'loader', LoaderController);
        }
    }

    export type Injectables = '$http' | '$compile' | '$scope' | '$element' | '$timeout' | '$timer' | '$location'| '$mdMedia';
    export type Bindables = '=' | '=?' | /**one way binding into the directive*/ '@' | '&';
    export class AngularController {
        static $inject: Injectables[];
        static selector: string;
    }
    /**
     * The controller to load app to avoid displaying uncompiled content.
     */
    export class LoaderController extends AngularController {
        static $inject: Injectables[] = ['$element'];
        static selector = 'loader';
        constructor(public $element: ng.IAugmentedJQuery) {
            super();
            //remove the loader class tag
            $element.removeClass('loader');
            //remove the loader-hide class tags;
            $element.find('.loader-hide').removeClass('loader-hide');
            //remove the loader-content elements:
            $element.find('.loader-content').remove();
        }
    }
    export class DirectiveRestrict {
        static E: string = 'E';
        static A: string = 'A';
        static AE: string = 'AE';
        static C: string = 'C';
    }
    export class BindingRestrict {
        static TwoWay: string = '=';
        static In: string = '@';
        static Callback: string = '&';
        static TwoWayOptional: string = '=?';
    }
    
    export class AngularDirective<Scope extends ng.IScope> implements ng.IDirective {
        static selector: string;
        public restrict: 'A'|'E'|'AE'|'C';
        public template: string;
        public templateUrl: string;
        public scope: Scope = <Scope>{};
        public controller: Function | any[];
        public link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attr:ng.IAttributes, ...args: any[]) => void;
        constructor() {
            return this;
        }
        public require: string;
        public controllerAs: string;
    }
    /**
     * Directive Scope for Content control.
     */
    export interface ContentDirectiveScope extends ng.IScope {
        data: string;
        view: string;
        controller: string;
        app: string;
        selector: string;
    }
    /**
     * Controller Scope for Content control.
     */
    export interface ContentScope extends ng.IScope {
        data: any;
        view: string;
        controller: any;
        app: any;
        selector: (data: any, templates: DataTemplate[]) => Promise<string>;
    }
    /**
     * DataTemplate definition for Conent control.
     */
    export class DataTemplate {
        key: string;
        path: string;
        type: string;
        url: string;
        template: string;
        jQuery: JQuery; 
    }

    export class DirectiveViewController {
        static $inject: Injectables[] = ['$scope', '$element', '$compile'];
        constructor(private $scope: IDirectiveViewScope, private $element: ng.IAugmentedJQuery, private $compile: ng.ICompileService) {
        }
        private _View: typeof AngularDirective;
        public get View(): typeof AngularDirective {
            return this._View;
        }
        private CurrentChildScope: ng.IScope;
        private CurrentElement: ng.IAugmentedJQuery;
        public set View(value: typeof AngularDirective) {
            this._View = value;
            //initialize the view;
            if (!value.selector || typeof value.selector != 'string') {
                console.error('Missing static selector field in the Angular Directive Type: ', value);
            }
            else {
                if (this.CurrentChildScope) this.CurrentChildScope.$destroy();
                this.$element.children().remove();
                //try compile the 
                this.CurrentChildScope = this.$scope.$new();
                this.CurrentElement = this.$compile('<{0}></{0}>'.format(value.selector))(this.CurrentChildScope);
                this.$element.append(this.CurrentElement);
            }
        }
    }
    export interface IDirectiveViewScope extends ng.IScope {
        ref: DirectiveViewController;
    }
    export interface IDirectiveViewDirectiveScope extends ng.IScope {
        ref: Bindables;
    }
    export class DirectiveViewDirecive extends AngularDirective<IDirectiveViewDirectiveScope>{
        constructor() {
            super();
            this.restrict = 'AE';
            this.scope.ref = '=?';
            this.controller = DirectiveViewController;
            this.controllerAs = 'ctrl';
        }
    }

    /**
     * Content control controller. It accepts template elements to generate views for data. 
     * It will invoke the selector to evaluate what view to use.
     * We suggest building a TabControl based on Content control.
     * Content control use $compile method to build element within subscope. subscope will be destroyed on the removal of corresponding element.
     */
    export class ContentController {
        static $inject = ['$compile', '$element', '$http', '$scope'];
        private childscope: ng.IScope;
        private templates: DataTemplate[] = [];
        constructor(public $compile: ng.ICompileService, public $element: ng.IAugmentedJQuery, public $http: ng.IHttpService, public $scope: ContentScope) {
            //this section will collect each of the view template from the inner of this model and they can be applied to each of the software.
            $element.children('template').each((index: number, elem: Element) => {
                var $elem: JQuery = $(elem);
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
                        .success((data: string) => {
                            template.template = data;
                            //we must check if the return value can affect the view of the content control.
                            if ($scope.selector) {
                                $scope.selector($scope.data, this.templates).then((result => {
                                    if ($scope.view != result) {
                                        //if view is affected, view must be updated.
                                        $scope.view = result;
                                        $scope.$digest();
                                    }
                                }));
                            } 
                        });
                }
                else {
                    template.template = $elem.html();
                }
                this.templates.push(template);
            });
            $element.children().remove();
            $scope.$watch('data', (newValue: any, oldValue: any) => {
                if ($scope.selector) {
                    $scope.selector(newValue, this.templates).then((template => {
                        if (typeof template == 'string') {
                            $scope.view = template;
                            $scope.$apply();
                        }
                    }));
                }
                else {
                    console.warn('Content View Warning: selector is undefined.\n' +
                        'Please provide a valid selector function:\n' +
                        'selector: (data: any, templates: DataTemplate[]) => string');
                }
            })
            //watch the view (string template) and compile it when changed.
            $scope.$watch('view', (newValue: string, oldValue: string) => {
                //destroy the existing element;
                if (this.childscope) this.childscope.$destroy();
                $element.children().remove();
                //create a new child scope.
                this.childscope = $scope.$parent.$new(); //use $parent to create childscope to access parent scope data
                $element.append($compile(newValue)(this.childscope));
            });
        }
    }
    /**
 * Control directive.
 */
    export class ContentDirective extends ngstd.AngularDirective<ContentDirectiveScope>{
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
}