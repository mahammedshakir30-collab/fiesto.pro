import { redirect } from "next/navigation";

export default function CompetitionsResultsRedirectPage({ params }: { params: { festivalId: string } }) {
  redirect(`/organizer/${params.festivalId}`);
}
