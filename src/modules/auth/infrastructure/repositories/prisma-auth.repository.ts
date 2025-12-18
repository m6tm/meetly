import { faker } from "@faker-js/faker";
import { AccountStatus, NotificationType, Theme } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/ports/auth.repository";

export class PrismaAuthRepository implements AuthRepository {
	private prisma = getPrisma();

	async saveUser(user: User): Promise<void> {
		await this.prisma.user.upsert({
			where: { id: user.id },
			update: {
				email: user.email,
				name: user.name,
				image: user.image,
			},
			create: {
				id: user.id,
				email: user.email,
				name: user.name,
				image: user.image,
			},
		});
	}

	async findUserById(id: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		return user;
	}

	async hasAllData(userId: string): Promise<boolean> {
		const [account, team, appearance, notificationPreference] =
			await Promise.all([
				this.prisma.account.findUnique({ where: { userId } }),
				this.prisma.team.findFirst({ where: { createdBy: userId } }),
				this.prisma.appearance.findUnique({ where: { userId } }),
				this.prisma.notificationPreference.findFirst({ where: { userId } }),
			]);

		return !!(account && team && appearance && notificationPreference);
	}

	async initializeUserRelatedData(
		userId: string,
		email: string,
	): Promise<void> {
		const teamName = email.split("@")[0] || faker.person.middleName();

		await this.prisma.$transaction([
			this.prisma.account.create({
				data: {
					status: AccountStatus.ACTIVE,
					userId: userId,
				},
			}),
			this.prisma.team.create({
				data: {
					name: teamName,
					createdBy: userId,
				},
			}),
			this.prisma.appearance.create({
				data: {
					userId: userId,
					theme: Theme.SYSTEM,
					language: "en",
				},
			}),
			this.prisma.notificationPreference.createMany({
				data: [
					{
						userId: userId,
						type: NotificationType.MEETING_REMINDER,
						enabled: true,
					},
					{
						userId: userId,
						type: NotificationType.TRANSCRIPTION_UPDATE,
						enabled: true,
					},
					{
						userId: userId,
						type: NotificationType.TEAM_ACTIVITY,
						enabled: true,
					},
					{
						userId: userId,
						type: NotificationType.NEWS_UPDATE,
						enabled: false,
					},
					{
						userId: userId,
						type: NotificationType.SECURITY_ALERT,
						enabled: true,
					},
				],
			}),
		]);
	}
}
