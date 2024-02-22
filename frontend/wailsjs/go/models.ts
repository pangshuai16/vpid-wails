export namespace usb {
	
	export class Device {
	    vid: string;
	    pid: string;
	    name: string;
	    vendor: string;
	    version: string;
	    class: string;
	    subclass: string;
	    protocol: string;
	
	    static createFrom(source: any = {}) {
	        return new Device(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.vid = source["vid"];
	        this.pid = source["pid"];
	        this.name = source["name"];
	        this.vendor = source["vendor"];
	        this.version = source["version"];
	        this.class = source["class"];
	        this.subclass = source["subclass"];
	        this.protocol = source["protocol"];
	    }
	}
	export class UsbList {
	    currentList: Device[];
	    addList: Device[];
	    removeList: Device[];
	
	    static createFrom(source: any = {}) {
	        return new UsbList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.currentList = this.convertValues(source["currentList"], Device);
	        this.addList = this.convertValues(source["addList"], Device);
	        this.removeList = this.convertValues(source["removeList"], Device);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

