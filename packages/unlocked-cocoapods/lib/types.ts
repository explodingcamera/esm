export interface Lockfile {
	PODS: PodEntry[];
	DEPENDENCIES: string[];
	"SPEC REPOS"?: {
		[specKey: string]: string[];
	};
	"EXTERNAL SOURCES"?: {
		[externKey: string]: ExternalSourceInfo;
	};
	"CHECKOUT OPTIONS"?: {
		[checkoutKey: string]: CheckoutOptions;
	};
	"SPEC CHECKSUMS": {
		[specCheckKey: string]: string;
	};
	"PODFILE CHECKSUM"?: string;
	COCOAPODS?: string;
}

type PodEntry =
	| string
	| {
			[key: string]: string[];
	  };

export type ExternalSourceInfoKey = ":podspec" | ":path" | ":git" | ":tag" | ":commit" | ":branch";
export type ExternalSourceInfo = {
	[K in ExternalSourceInfoKey]?: string;
};

export type CheckoutOptionKey = ExternalSourceInfoKey;
export type CheckoutOptions = {
	[K in CheckoutOptionKey]?: string;
};
