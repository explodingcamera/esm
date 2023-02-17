export interface Lockfile {
	PODS: PodEntry[];
	DEPENDENCIES: string[];
	"SPEC REPOS"?: {
		[key: string]: string[];
	};
	"EXTERNAL SOURCES"?: {
		[key: string]: ExternalSourceInfo;
	};
	"CHECKOUT OPTIONS"?: {
		[key: string]: CheckoutOptions;
	};
	"SPEC CHECKSUMS": {
		[key: string]: string;
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
