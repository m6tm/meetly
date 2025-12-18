import { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/ports/auth.repository";

export class SyncUserUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(userData: {
		id: string;
		email: string;
		name?: string | null;
		image?: string | null;
	}): Promise<void> {
		const user = new User(
			userData.id,
			userData.email,
			userData.name,
			userData.image,
		);

		// 1. Sauvegarder ou mettre à jour l'utilisateur
		await this.authRepository.saveUser(user);

		// 2. Vérifier si les données liées existent
		const isComplete = await this.authRepository.hasAllData(user.id);

		if (!isComplete) {
			// 3. Initialiser les données liées (Account, Team, Appearance, Preferences)
			await this.authRepository.initializeUserRelatedData(user.id, user.email);
		}
	}
}
