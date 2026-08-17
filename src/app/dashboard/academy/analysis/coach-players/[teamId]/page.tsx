import TeamDetails from "@/components/user-wise-dashboard/academy-analysis/TeamDetails";

interface PageProps {
  params: Promise<{ teamId: string }>;
}

const TeamDetailsPage = async ({ params }: PageProps) => {
const resolvedParams = await params;
return <TeamDetails teamId={resolvedParams.teamId} />;
}
export default TeamDetailsPage;
