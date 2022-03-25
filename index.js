const TokenType = {
	LEFT_PAREN: "LEFT_PAREN",
	RIGHT_PAREN: "RIGHT_PAREN",
	LEFT_BRACE: "LEFT_BRACE",
	RIGHT_BRACE: "RIGHT_BRACE",
	COMMA: "COMMA",
	DOT: "DOT",
	MINUS: "MINUS",
	PLUS: "PLUS",
	SEMICOLON: "SEMICOLON",
	SLASH: "SLASH",
	STAR: "STAR",
	BANG: "BANG",
	BANG_EQUAL: "BANG_EQUAL",
	EQUAL: "EQUAL",
	EQUAL_EQUAL: "EQUAL_EQUAL",
	GREATER: "GREATER",
	GREATER_EQUAL: "GREATER_EQUAL",
	LESS: "LESS",
	LESS_EQUAL: "LESS_EQUAL",
	IDENTIFIER: "IDENTIFIER",
	STRING: "STRING",
	NUMBER: "NUMBER",
	AND: "AND",
	CLASS: "CLASS",
	ELSE: "ELSE",
	FALSE: "FALSE",
	FUN: "FUN",
	FOR: "FOR",
	IF: "IF",
	NIL: "NIL",
	OR: "OR",
	PRINT: "PRINT",
	RETURN: "RETURN",
	SUPER: "SUPER",
	THIS: "THIS",
	TRUE: "TRUE",
	VAR: "VAR",
	WHILE: "WHILE",
	EOF: "EOF"
};

const Keywords = {
	"and": TokenType.AND,
	"class": TokenType.CLASS,
	"else": TokenType.ELSE,
	"false": TokenType.FALSE,
	"for": TokenType.FOR,
	"fn": TokenType.FUN,
	"if": TokenType.IF,
	"nil": TokenType.NIL,
	"or": TokenType.OR,
	"log": TokenType.PRINT,
	"return": TokenType.RETURN,
	"super": TokenType.SUPER,
	"this": TokenType.THIS,
	"true": TokenType.TRUE,
	"var": TokenType.VAR,
	"while": TokenType.WHILE,
};

class Token {
	constructor(type, lexme, literal, line) {
		this.type = type;
		this.lexme = lexme;
		this.literal = literal;
		this.line = line;
	}
	toString() {
		return this.type + " " + this.lexme + " " + this.literal;
	}
}

class Scanner {
	constructor(source) {
		this.source = source;

		this.tokens = [];
		this.start = 0;
		this.current = 0;
		this.line = 1;
	}
	scanTokens() {
		while (!this.isEOF()) {
			this.start = this.current;
			this.scanToken();
		}
		this.tokens.push(new Token(TokenType.EOF, "", undefined, this.line));
		return this.tokens;
	}
	scanToken() {
		const c = this.advance();
		switch (c) {
			case "(": this.addToken(TokenType.LEFT_PAREN); break;
			case ")": this.addToken(TokenType.RIGHT_PAREN); break;
			case "{": this.addToken(TokenType.LEFT_BRACE); break;
			case "}": this.addToken(TokenType.RIGHT_BRACE); break;
			case ",": this.addToken(TokenType.COMMA); break;
			case ".": this.addToken(TokenType.DOT); break;
			case "-": this.addToken(TokenType.MINUS); break;
			case "+": this.addToken(TokenType.PLUS); break;
			case ";": this.addToken(TokenType.SEMICOLON); break;
			case "*": this.addToken(TokenType.STAR); break;
			case "!": this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG); break;
			case "=": this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
			case "<": this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS); break;
			case ">": this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
			case "o": if (this.peek() == "r") this.addToken(TokenType.OR); break;
			case "\n": this.line++; break;
			case "\"": this.string(); break;
			case "/":
				if (this.match("/"))
					while (this.peek() != "\n" && !this.isEOF())
						this.advance();
				else if (this.match("*")) {
					while (this.peekPair() != "*/" && !this.isEOF())
						this.advance();
					//Hack to advance the end of the block comment.
					this.advance();
					this.advance();
				}
				else this.addToken(TokenType.SLASH);
				break;
			case " ":
			case "\r":
			case "\t":
				break;
			default:
				if (this.isDigit(c)) this.number();
				else if (this.isAlpha(c)) this.identifier();
				else console.error(this.line, "Unexpected char.");
				break;
		}
	}
	advance() {
		this.current++;
		return this.source.charAt(this.current - 1);
	}
	addToken(tokenType) {
		this.addToken(tokenType, undefined);
	}
	addToken(tokenType, literal) {
		const text = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(tokenType, text, literal, this.line));
	}
	match(char) {
		if (this.isEOF()) return false;
		if (this.source.charAt(this.current) != char) return false;
		this.current++;
		return true;
	}
	peek() {
		if (this.isEOF()) return "\0";
		return this.source.charAt(this.current);
	}
	peekNext() {
		if (this.current + 1 >= this.source.length) return "\0";
		return this.source.charAt(this.current + 1);
	}
	peekPair() {
		if (this.isEOF()) return "\0";
		if (this.current + 1 >= this.source.length) return "\0";
		return this.source.substring(this.current, this.current + 2);
	}
	string() {
		while (this.peek() != "\"" && !this.isEOF()) {
			if (this.peek() == "\n") this.line++;
			this.advance();
		}

		if (this.isEOF()) {
			console.error(this.line, "Unclosed string.");
			throw new Error("");
		}
		this.advance();

		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, value);
	}
	number() {
		while (this.isDigit(this.peek()))
			this.advance();

		if (this.peek() == "." && this.isDigit(this.peekNext())) {
			this.advance();
			while (this.isDigit(this.peek()))
				this.advance();
		}

		this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
	}
	identifier() {
		while (this.isAlphaNumberic(this.peek()))
			this.advance();

		const text = this.source.substring(this.start, this.current);
		let type = Keywords[text];
		if (type != undefined) type = TokenType.IDENTIFIER;
		this.addToken(type);
	}
	isAlpha(c) {
		return (c >= "a" && c <= "z") ||
			(c >= "A" && c <= "Z") || c == "_";
	}
	isAlphaNumberic(c) {
		return this.isAlpha(c) || this.isDigit(c);
	}
	isDigit(c) {
		return !isNaN(c) && c != " ";
	}
	isEOF() {
		return this.current >= this.source.length;
	}
}

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

function main(args) {
	if (args.length > 1) {
		console.log("Usage: ul [scriptPath]");
	} else if (args.length === 1) {
		runFile(args[0]);
		console.log("runFile(args[0])");
	}
}
