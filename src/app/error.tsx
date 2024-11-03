"use client";

export default function GlobalError() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-md p-6 bg-white rounded-lg shadow-lg text-center'>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Oops! Something went wrong 😞</h1>
        <p className='text-gray-600 mb-6'>
          We’re sorry, but we’re unable to load this page at the moment. Please try refreshing, or come back later.
        </p>

        <div className='flex justify-center gap-4 mb-4'>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'
          >
            Refresh Page
          </button>
        </div>

        <p className='text-gray-500'>
          Still having issues?{" "}
          <div>
            <a className='text-blue-600 hover:underline' href='mailto:dominik@domkss.dev'>
              Contact Support
            </a>
          </div>
        </p>
      </div>
    </div>
  );
}
