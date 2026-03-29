

export default function AccountInfo() {
  return (
    <div className="flex flex-col min-h-screen w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
      
        
        <div className="flex flex-col items-center gap-10 text-center sm:items-start sm:text-center">
          <h1 className="max-w-xs  ml-15 text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Account Details
          </h1>
          <p className="max-w-md ml-18 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            First Name {" "}
          </p>
          <input 
             type="text" 
             placeholder="Name"
             className="w-full max-w-x -mt-5 ml-18 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
          </input>
          <input 
             type="text" 
             placeholder="Password"
             className="w-full max-w-x -mt-3 ml-30 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
          </input>
          <p className="max-w-md ml-78 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            OR
          </p>
        </div>
        <div className="flex flex-col mt-10 ml-60 gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-14 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            //href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google SSO
          </a>
        </div>
        <p className="max-w-md ml-58 mt-13 text-lg leading-8 text-zinc-600 dark:text-zinc-400 ">
            Forgot your password?{" "}
          </p>

      </main>
    </div>
  );
}
