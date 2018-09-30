/* global window */

export class SceneEntityLoader {

	// sceneDynamicLoader should be a DynamicLoader that
	// is already initialized with authorization tokens for a scene
	constructor(sceneDynamicLoader) {
		this.sceneDynamicLoader = sceneDynamicLoader;
		this.loadedEntities = [];
	}

	// This mostly just passed the load call down
	// to our dynamic loader, but also keeps track of
	// the loaded entity to help clean it up later
	async load(id, options) {
		const entity = await this.sceneDynamicLoader.load(id, options);
		this.loadedEntities.push(entity);
		return entity;
	}

	cleanup() {
		this.loadedEntities.forEach(entity => entity.id.endsWith(".entity") && entity.removeFromWorld());
	}
}

export class SceneLoader {

    constructor(region, sumerian, world, credentials) {
        
        this._sumerian = sumerian;
        this._world = world;
		this._region = region;
		this._credentials = credentials;
		this._loaders = [];
    }
    
    async loadRelease(sumerian_config) {

		const url = sumerian_config.url
		const sceneId = sumerian_config.sceneId

        
		const res = await window.fetch(this._sign(url, this._credentials));
		const json = await res.json();
		const bundleRequestData = json.bundleData;
		const binaryRequestData = json.binaryRequestData;

		const authorizationRequestData = Object.assign({}, bundleRequestData, binaryRequestData);
       	const options = {
				binaryRequestData : authorizationRequestData
		};
		const ajax = new this._sumerian.Ajax('', options);

       	const dynamicLoader = new this._sumerian.DynamicLoader({world : this._world, ajax});

		const bundleURL = json.bundleData[sceneId].url;
		const bundle = await (await window.fetch(bundleURL)).json();

		await dynamicLoader._ajax.prefill(bundle);
		const entityLoader = new SceneEntityLoader(dynamicLoader);
		this._loaders.push(entityLoader);
		return entityLoader;

	}

	cleanup() {
		this._loaders.forEach(loader=> loader.cleanup())
	}
	

	_sign(urlString, credentials) {
		// Total hack to sign our release URL

		const url = new URL(urlString);
		const uri = `${url.pathname}${url.search}`

		//Turn off param validation because of the hackery coming up
		var service = new AWS.STS({endpoint : url.origin, credentials : credentials, paramValidation: false});
	 
		service.api.signingName = "sumerian";
	 
		//1. Create a request object for another, sorta similar request
		//2. Sign it!
		var req = service.getCallerIdentity({});
		req.on("afterBuild", function(data){ data.httpRequest.path = uri; });
		return req.presign();
	};
}
