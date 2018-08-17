(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.window = global.window || {})));
}(this, (function (exports) { 'use strict';

    /* global window */
    class LoaderFactory {

        constructor(region, sumerian, world) {
            
            this._sumerian = sumerian;
            this._world = world;
            this._region = region;
        }
        
        async getLoader(sceneId) {
            const url= `https://${this._region}.sumerian.amazonaws.com/api/projects/abc/resources/${sceneId}/publish`;
            
    		const res = await window.fetch(url);
    		const json = await res.json();
    		const bundleRequestData = json.bundleData;
    		const binaryRequestData = json.binaryRequestData;

    		const authorizationRequestData = Object.assign({}, bundleRequestData, binaryRequestData);
           	const options = {
    				binaryRequestData : authorizationRequestData
    		};
    		const ajax = new this._sumerian.Ajax('', options);
            
           	return new this._sumerian.DynamicLoader({world : this._world, ajax});
        }

    }

    const sumerian_helpers = {
        LoaderFactory 
    };

    exports.sumerian_helpers = sumerian_helpers;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
