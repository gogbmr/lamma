import NewsForm from "../news-form";

export default function CreateNewsPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Create Article
        </h1>

        <p className="text-muted-foreground">
          Create a new news article for
          the platform.
        </p>
      </div>

      <NewsForm mode="create" />
    </main>
  );
}