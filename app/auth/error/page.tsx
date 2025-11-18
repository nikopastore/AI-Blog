import Link from "next/link";

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchParams.error || 'An error occurred during authentication'}
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}
