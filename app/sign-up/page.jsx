import React from 'react'
import SignUpForm from '../(components)/SignupForm'

const page = () => {
  return (
    <div className='h-screen w-full flex justify-center items-center' style={{backgroundImage: "url('/loginBG.jpg')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <SignUpForm/>
    </div>
  )
}

export default page
