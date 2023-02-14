export interface Root {
	metadata: Metadata;
	libraries: Library[];
	licenses: Licenses;
}

export interface Metadata {
	generated: string;
}

export interface Library {
	uniqueId: string;
	funding: Array<string>;
	developers: Developer[];
	artifactVersion: string;
	description: string;
	scm?: Scm;
	name: string;
	website?: string;
	licenses: string[];
}

export interface Developer {
	name: string;
	organisationUrl?: string;
}

export interface Scm {
	connection?: string;
	url: string;
	developerConnection?: string;
}

export type Licenses = Record<string, License>;

export interface License {
	content: string;
	hash: string;
	url: string;
	internalHash?: string;
	spdxId?: string;
	name?: string;
}
