import Scanner from "./scanner.js";

async function runFile(scriptPath) {
	var scriptContent = "";
	await fetch(scriptPath)
		.then(resp => {
			if(resp.status != 404) return resp.text();
			else throw new Error("File not found");
		})
		.then(text => scriptContent = text);
	const scanner = new Scanner(scriptContent);
	let tokens = scanner.scanTokens();
	tokens.forEach(t => console.log(t));
}

export function main(args) {
	if (args.length > 1) {
		console.log("Usage: ul [scriptPath]");
	} else if (args.length === 1) {
		runFile(args[0]);
		console.log(`Running file: ${args[0]}`);
	}
}

export default main;