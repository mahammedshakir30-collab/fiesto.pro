import { redirect } from "next/navigation";

export default function ResultsRedirectPage({ params }: { params: { festivalSlug: string } }) {
  redirect(`/discover/${params.festivalSlug}/standings`);
}
