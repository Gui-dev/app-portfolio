export function initials(name: string): string {
	const words = name
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0);

	if (words.length === 0) {
		return "?";
	}

	const first = firstLetter(words[0]);
	if (words.length === 1) {
		return first;
	}

	const last = firstLetter(words[words.length - 1]);
	return `${first}${last}`;
}

function firstLetter(word: string): string {
	const normalized = word
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^A-Za-z0-9]/g, "");

	const char = normalized[0] ?? "?";
	return char.toUpperCase();
}
