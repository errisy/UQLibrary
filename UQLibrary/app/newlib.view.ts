class NewLibController {
    $inject: ngstd.Injectables[] = ['$http', '$scope', '$mdMedia'];
    public client: LibraryDataClient;
    constructor(public $http: ng.IHttpService, public $scope: INewLibScope, public $mdMedia: ng.material.IMedia) {
        this.client = new LibraryDataClient($http);
    }
    /**
     * called by ng-init
     */
    public onLoaded() {
        this.Library = <any>{};     
    }
    /**instance of the new library */
    public Library: LibraryTypes.ILibrary;
    /**to disable save button when it is submitting data */
    public SaveDisabled: boolean = false;
    /**show the status/progress of submitting data*/
    public status: string;
    /**
     * triggered by Save button
     * check errors and submit
     */
    async Save() {
        if (this.SaveDisabled) return;
        if (LibDataFilters.hasKeys(this.$scope.libraryForm.$error)) {
            this.status = 'Errors found!';
            return;
        }
        this.status = 'Creating new Library...';
        this.SaveDisabled = true;
        try {
            this.status = (await this.client.createLibrary(this.Library)) ? 'Library Successfully Created!' : 'Failed.';
        }
        catch (ex) {
            console.error('Error while creating library: ', ex);
            this.status = 'Error while creating library.';
        }
        this.SaveDisabled = false;
        //apply should be called after async call.
        this.$scope.$apply();
    }
    /**
     * triggered by cancel button, navigate to library list (set displayMode = today)
     */
    Cancel() {
        this.SaveDisabled = true;
        let main: MainController = this.$scope.$parent['ctrl'];
        main.displayMode = 'today';
    }
}

interface INewLibScope extends ng.IScope {
    libraryForm: ILibraryFormController;
}

interface ILibraryFormController extends ng.IFormController {
    lid: ng.INgModelController;
    name: ng.INgModelController;
    abbr: ng.INgModelController;
    desc: ng.INgModelController;
    campus: ng.INgModelController;
    url: ng.INgModelController;
    lat: ng.INgModelController;
    long: ng.INgModelController;
}

class NewLibDirective extends ngstd.AngularDirective<ng.IScope> {
    static selector = 'newlib';
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/newlib.view.html');
        this.controller = NewLibController;
        this.controllerAs = 'ctrl';
        return this;
    }
}