import { SignIn } from '@clerk/nextjs';
import React from 'react';

const SignInPage = () => {
  return (
    <main className="flex flex-col items-center justify-center h-[calc(100vh-110px)] mt-8 relative">
      <SignIn />
      <div className="absolute bottom-4 max-w-4xl overflow-hidden">
        <p className=" whitespace-nowrap text-sm text-gray-600">
          Made with ❤️ <a href="https://alihamzakamboh.com" className="underline px-1 hover:text-primary transition-colors duration-200">ahkamboh</a>
        </p>
      </div>
    </main>
  );
};

export default SignInPage;