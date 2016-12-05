/// <reference path="../lib/ngstd.ts" />

class DetailController {
    $inject: ngstd.Injectables[] = ['$scope', '$mdMedia'];
    constructor(public $scope: ng.IScope, public $mdMedia: ng.material.IMedia) {
    }
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    get parent(): MainController {
        return this.$scope.$parent['ctrl'];
    }
    /**the library to present*/
    public library: LibraryTypes.ILibraryHoursByDay;
    /**
     * called by ng-init, get the selected library
     */
    onLoad(){
        this.library = this.parent.SelectedLibrary;
    }
}

class DetailDirective extends ngstd.AngularDirective<ng.IScope> {
    static selector = 'detail';
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/detail.view.html');
        this.controller = DetailController;
        this.controllerAs = 'ctrl';
        return this;
    }
}