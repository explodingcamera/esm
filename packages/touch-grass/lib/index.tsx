import { Box, render, Text, useApp, useInput, useStdin } from "ink";
import { useEffect, useState } from "react";
import useScreenSize from "./screensize.js";

const formatDuration = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const TouchGrass = () => {
	const app = useApp();
	const { stdin } = useStdin();
	const { height, width } = useScreenSize();

	const [time, setTime] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setTime((time) => time + 1);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		stdin.setRawMode(true);
		stdin.resume();
		stdin.setEncoding("utf8");
	}, [stdin]);

	useInput((input, key) => {
		if (key.escape) {
			app.exit();
		}
	});

	return (
		<Box width={width} height={height} flexDirection="column">
			<Box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
				<Box height={1} />
				<Text color="#999999">You can stop sitting at your computer now.</Text>
				<Box height={1} />
				<Text>
					You've been here for <Text bold>{formatDuration(time)}</Text>
				</Text>
			</Box>
			<Box alignSelf="flex-end">
				<Text color="#999999">
					Press <Text bold>ESC</Text> to exit.
				</Text>
			</Box>
		</Box>
	);
};

process.stdout.write("\x1b[?1049h");
const app = render(<TouchGrass />);
await app.waitUntilExit();
process.stdout.write("\x1b[?1049l");
process.stdin.setRawMode(false);
process.exit();
