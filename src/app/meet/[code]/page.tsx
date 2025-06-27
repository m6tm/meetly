import MeetPage from "./main"


export default async function Page({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    return (
        <MeetPage {...{ code }} />
    )
}