import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Met à jour la session utilisateur et gère les redirections d'authentification.
 * 
 * @param request - L'objet NextRequest entrant.
 * @returns Une instance de NextResponse avec les cookies mis à jour ou une redirection.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    )

    // Ne pas exécuter de code entre createServerClient et supabase.auth.getUser().
    // Une simple erreur pourrait rendre très difficile le débogage des problèmes 
    // de déconnexion aléatoire des utilisateurs.

    // IMPORTANT : NE PAS SUPPRIMER auth.getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/signin') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        // Aucun utilisateur, on redirige vers la page de connexion
        const url = request.nextUrl.clone()
        url.pathname = '/signin'
        return NextResponse.redirect(url)
    }

    // IMPORTANT : Vous *devez* retourner l'objet supabaseResponse tel quel.
    // Si vous créez un nouvel objet de réponse avec NextResponse.next(), assurez-vous de :
    // 1. Lui passer la requête, comme ceci :
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copier les cookies, comme ceci :
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Modifier l'objet myNewResponse selon vos besoins, mais évitez de changer les cookies !
    // 4. Enfin :
    //    return myNewResponse
    // Si cela n'est pas fait, vous pourriez désynchroniser le navigateur et le serveur
    // et interrompre prématurément la session de l'utilisateur !

    return supabaseResponse
}