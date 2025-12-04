import PhotoDetailWrapper from "@/components/photo-detail-wrapper";

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 md:py-12">
      <PhotoDetailWrapper photoId={id} />
    </main>
  );
}
