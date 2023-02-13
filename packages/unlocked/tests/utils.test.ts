import { describe, expect, test } from "vitest";
import { qualifiedToResolvableName } from "../lib/utils";

describe("qualidiedToUnqualified", () => {
	test("should convert a qualified dependency to an unqualified one", () => {
		expect(qualifiedToResolvableName("/@test/test-test/v1.1.1")).toMatchInlineSnapshot('"@test/test-test"');
		expect(qualifiedToResolvableName("/tslib/2.5.0")).toMatchInlineSnapshot('"tslib"');
	});
});
