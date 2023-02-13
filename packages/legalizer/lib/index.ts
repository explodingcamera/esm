import { cwd } from "process";
import { unlock } from "unlocked";

export const run = async () => {
	let lockfile = await unlock(cwd(), {});
};
