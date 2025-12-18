export class User {
	constructor(
		public readonly id: string,
		public readonly email: string,
		public readonly name?: string | null,
		public readonly image?: string | null,
	) {}
}
