import { WebhookReceiver } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { endMeetingSession } from "@/actions/meetly-meet-manager";

const receiver = new WebhookReceiver(
	process.env.LIVEKIT_KEY!,
	process.env.LIVEKIT_SECRET!,
);

export async function POST(request: Request) {
	try {
		// Lire le body comme texte
		const body = await request.text();

		// Récupérer l'header Authorization
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return new Response("Missing Authorization header", { status: 401 });
		}

		// Recevoir et valider le webhook
		const event = await receiver.receive(body, authHeader);
		const room = event.room;
		const participant = event.participant;
		const track = event.track;

		console.log("Webhook reçu:", {
			event: event.event,
			room: room?.name,
			participant: participant?.identity,
			createdAt: event.createdAt,
		});

		// Traiter selon le type d'événement
		switch (event.event) {
			case "room_started":
				console.log("🟢 Nouvelle room:", event.room?.name);
				// Votre logique ici
				break;

			case "room_finished":
				console.log("🔴 Room terminée:", event.room?.name);
				// Sauvegarder en base par exemple
				break;

			case "participant_joined":
				console.log("👤 Participant rejoint:", event.participant?.identity);
				break;

			case "participant_left":
				console.log("👤 Participant parti:", event.participant?.identity);
				if (!room?.numParticipants) endMeetingSession(room?.name!);
				break;

			case "track_published":
				console.log("📹 Track publié:", event.track?.name);
				break;

			case "track_unpublished":
				console.log("📹 Track dépublié:", event.track?.name);
				break;

			case "egress_started":
				console.log("🎥 Enregistrement egress démarré");
				break;

			case "egress_ended":
				console.log("🎥 Enregistrement egress terminé");
				break;

			case "egress_updated":
				console.log("🎥 Enregistrement egress mis à jour");
				break;

			case "ingress_ended":
				console.log("🎥 Enregistrement ingress terminé");
				break;

			case "ingress_started":
				console.log("🎥 Enregistrement ingress démarré");
				break;

			default:
				console.log("Événement non géré:", event.event);
		}

		return new Response("OK", { status: 200 });
	} catch (error) {
		console.error("Erreur webhook:", error);
		return new Response("Invalid webhook", { status: 400 });
	}
}

// Si vous utilisez d'autres méthodes, ajoutez une réponse par défaut
export async function GET() {
	return NextResponse.json({ message: "OK" });
}
