import type { User } from "../entities/user";

export interface AuthRepository {
	saveUser(user: User): Promise<void>;
	findUserById(id: string): Promise<User | null>;
	initializeUserRelatedData(userId: string, email: string): Promise<void>;
	hasAllData(userId: string): Promise<boolean>;
}
