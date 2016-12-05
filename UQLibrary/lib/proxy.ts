/**data contract for node.js server to work as proxy*/
interface IHttpProxy {
    method: 'POST' | 'GET';
    link: string;
    data: string;
    config?: ng.IHttpRequestConfigHeaders;
}
interface IHttpService {
    get: <T>(url: string, config?: ng.IHttpRequestConfigHeaders) => ng.IHttpPromise<ng.IHttpPromiseCallbackArg<{}>>;
    post: <T>(url: string, data: any, config?: ng.IHttpRequestConfigHeaders) => ng.IHttpPromise<ng.IHttpPromiseCallbackArg<{}>>;
}

/**
 * The proxy class that wrap the $http service to retreive data directly or via node.js proxy.
 */
class HttpProxy implements IHttpService {
    constructor(public $http: ng.IHttpService, public proxyLink: string) {
    }
    public useProxy: boolean = false;
    /**
     * get the json data from the link
     * @param link
     */
    public get<T>(link: string, config?: ng.IHttpRequestConfigHeaders) {
        if (this.useProxy) {
            return this.getByProxy(link, config);
        }
        else {
            let error: boolean;
            try {
                return this.$http.get(link, config);
            }
            catch (ex) {
                console.warn('error when connecting to server, try proxy now.');
                error = true;
            }
            if (error) {
                //try the proxy
                this.useProxy = true; //use proxy next time.
                return this.getByProxy(link, config);
            }
        }
    }
    public post<T>(link: string, data: any, config?: ng.IHttpRequestConfigHeaders) {
        if (this.useProxy) {
            return this.postByProxy<T>(link, data, config);
        }
        else {
            let error: boolean;
            try {
                return this.$http.post<T>(link, data, config);
            }
            catch (ex) {
                console.log(ex);
                error = true;
            }
            if (error) {
                //try the proxy
                this.useProxy = true; //use proxy next time.
                return this.postByProxy<T>(link, data, config);
            }
        }
    }
    private getByProxy<T>(link: string, config?: ng.IHttpRequestConfigHeaders) {
        let iproxy: IHttpProxy = {
            data: null,
            link: link,
            method: 'GET',
            config: config
        }
        return this.$http.post<T>(this.proxyLink, iproxy);
    }
    private postByProxy<T>(link: string, data: any, config?: ng.IHttpRequestConfigHeaders) {
        let iproxy: IHttpProxy = {
            data: data,
            link: link,
            method: 'POST',
            config: config
        }
        return this.$http.post<T>(this.proxyLink, iproxy);
    }
}