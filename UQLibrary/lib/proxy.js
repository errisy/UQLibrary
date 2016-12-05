var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * The proxy class that wrap the $http service to retreive data directly or via node.js proxy.
 */
class HttpProxy {
    constructor($http, proxyLink) {
        this.$http = $http;
        this.proxyLink = proxyLink;
        this.useProxy = false;
    }
    /**
     * get the json data from the link
     * @param link
     */
    get(link, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.useProxy) {
                return yield this.getByProxy(link, config);
            }
            else {
                let error;
                try {
                    return yield this.$http.get(link, config);
                }
                catch (ex) {
                    console.warn('error when connecting to server, try proxy now.');
                    error = true;
                }
                if (error) {
                    //try the proxy
                    this.useProxy = true; //use proxy next time.
                    return yield this.getByProxy(link, config);
                }
            }
        });
    }
    post(link, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.useProxy) {
                return yield this.postByProxy(link, data, config);
            }
            else {
                let error;
                try {
                    return yield this.$http.post(link, data, config);
                }
                catch (ex) {
                    console.log(ex);
                    error = true;
                }
                if (error) {
                    //try the proxy
                    this.useProxy = true; //use proxy next time.
                    return yield this.postByProxy(link, data, config);
                }
            }
        });
    }
    getByProxy(link, config) {
        return __awaiter(this, void 0, void 0, function* () {
            let iproxy = {
                data: null,
                link: link,
                method: 'GET',
                config: config
            };
            let result = yield this.$http.post(this.proxyLink, iproxy);
            return result;
        });
    }
    postByProxy(link, data, config) {
        return __awaiter(this, void 0, void 0, function* () {
            let iproxy = {
                data: data,
                link: link,
                method: 'POST',
                config: config
            };
            return yield this.$http.post(this.proxyLink, iproxy);
        });
    }
}
//# sourceMappingURL=proxy.js.map