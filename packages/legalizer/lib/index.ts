import { cwd } from "process";
import { unlock } from "unlocked";

export const run = async () => {
	const lockfile = await unlock(cwd(), {});
};
