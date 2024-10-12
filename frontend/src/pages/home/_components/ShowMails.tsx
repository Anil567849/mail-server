import React from 'react'

const data = [
    'a','b','c','d','a','b','c','d','a','b','c','d','a','b','c','d','a','b','c','d',
]

function ShowMails() {
  return (
    <div className='flex flex-col border-4 border-black max-h-[100%] overflow-y-auto'>
        {
            data.map((item, ind) => {
                return (
                <div className="flex border rounded-3xl h-[3rem] my-2 text-left p-2">
                    <div className="w-[30%] email">Email</div>
                    <div className="w-[70%] subject">Subject</div>
                </div>
                )
            })
        }
                
    </div>
  )
}

export default ShowMails