import EmailForm from './_components/EmailForm'
import ShowMails from './_components/ShowMails'

function Home() {
  return (
    <div className='flex min-h-screen max-h-screen border-4 border-red-700'>

        <div className="flex-1 border-4 border-red-700">
            <EmailForm />
        </div>
        <div className="flex-1 border-4 border-red-700">
            <ShowMails />
        </div>
        
    </div>
  )
}

export default Home