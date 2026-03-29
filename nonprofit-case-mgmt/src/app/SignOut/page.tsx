"use client";
 import {useRouter} from "next/navigation";
export default function Signout() {

   

      const router = useRouter();

   

    return(


        <div className="flex flex-col min-h-screen w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
       



        <p className="max-w-md text-2xl font-bold text-center leading-8 text-black dark:zinc-400 -translate-y-20">
            Are you sure you would like to logout?{" "}
          </p>

            <button

          onClick={() => router.push("/Login")}

          className="absolute w-60 bottom-100 right-128 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-400" >


            Yes, log me out.
          </button>

           <button

           onClick={() => router.push("/dashboard")}

          className="absolute w -60 bottom-100 right-200 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-400"

          >

            No, return to dashboard.
          </button>


          


 </div>
        
       
    );





}