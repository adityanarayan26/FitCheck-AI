import React from 'react'
import LogInForm from '../(components)/LoginForm'

const page = () => {
  return (
    <div className='h-screen w-full flex justify-center items-center' style={{backgroundImage: "url('/loginBG.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
<LogInForm/>
    </div>
  )
}

export default page
