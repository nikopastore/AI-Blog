export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="text-gray-600 dark:text-gray-400">
            A sign in link has been sent to your email address. Click the link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
