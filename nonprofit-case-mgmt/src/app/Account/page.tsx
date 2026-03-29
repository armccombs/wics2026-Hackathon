"use client";
import { useState} from "react";

import {useRouter} from "next/navigation";

export default function AccountInfo() {

  const[popupType, setPopupType] = useState(null);
  const router = useRouter();
  return (


<div className="relative min-h-screen w-screen bg-white" >
{popupType && (
  

<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
  onClick={() => setPopupType(null)}
  >
  <div className=  "bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
    onClick={(e) => e.stopPropagation()}
    >
    <h2 className="text-xl font-semibold mb-4">Confirm change?</h2>

    <p className="mb-6 text-zinc-600">
      Are you sure you want to change your {popupType}?

    </p>

    <div className="flex justify-end gap-4">
      <button
      onClick={() => setPopupType(null)}
      className="px-4 py-2 border rounded-lg"
      >
       Cancel
      </button>
      <button
      onClick={() => setPopupType(null)}
      className="px-4 py-2 border rounded-lg"
      >

      Confirm

      </button>
      </div>
      </div>
    </div>
  


)}



   
      <h1 className="absolute top-30 left-19 text-3xl font-semibold">
        Account Details
      </h1>

   
       <div className="absolute top-50 left-20 w-full max-w-3xl">
        <p className="mb-4 text-lg">Username: TonkaJahari1213</p>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="New Username"
            className="w-full max-w-md px-1 py-2 border rounded-lg"
          />

          <button 
          onClick={() => setPopupType("username")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-400"
            >
            Update Username
          </button>

      </div>
      </div>
      <div className="absolute top-83 left-20 w-full max-w-3xl">
        <p className="mb-4 text-lg">Name: Tonka Jahari</p>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder=" New First Name"
            className="w-full max-w-xs px-1 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder=" New Last Name"
            className="w-full max-w-xs px-1 py-2 border rounded-lg"
          />

          <button 
           onClick={() => setPopupType("name")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-400"
           >
            Update Name
          </button>
        </div>
      </div>
    

       <div className="absolute top-115 left-20 w-full max-w-3xl">
        <p className="mb-4 text-lg">Email: TJ09@gmail.com</p>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="New Email Address"
            className="w-full max-w-md px-1 py-2 border rounded-lg"
          />

          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-400"
           onClick={() => setPopupType("email")}
           >
            Update Email Address
          </button>
        </div>
        </div>
        
        

    <div className="absolute top-139 left-20 w-full max-w-3xl">
    <p className="mb-4 text-lg">Phone Number: 480-908-9254</p>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="New Phone Number"
            className="w-full max-w-sm px-1 py-2 border rounded-lg"
          />

          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-400"
            onClick={() => setPopupType("phone number")}

            >
            Update Phone Number
          </button>


    



        </div>


        </div>





          <button

          onClick={() => router.push("/dashboard")}

          className="absolute
           bottom-10 right-10 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-400"

          >

            Return to Dashboard
          </button>



    


      
      
      
      
      
     </div>
      

      
      
    
    
  );
}
