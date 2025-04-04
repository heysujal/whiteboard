'use client';

import { Pencil, Users, Shield, Clock } from 'lucide-react';
import Link from 'next/link'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pencil className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Whiteboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={'/signin'}>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href={'/signup'}>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                Collaborate Visually,
                <span className="text-blue-600"> Create Together</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The most intuitive digital whiteboard for teams. Brainstorm, plan, and innovate together in real-time.
              </p>
              <button 
                onClick={() => router.push(`/signup`)} 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Get Started
              </button>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600/20 rounded-lg blur-xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Whiteboard Dashboard" 
                  className="relative rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group hover:bg-blue-50 p-6 rounded-xl transition-colors">
              <div className="bg-blue-100 p-4 rounded-full w-fit mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Collaboration</h3>
              <p className="text-gray-600">
                Work together in real-time with your team. See changes instantly and collaborate effortlessly.
              </p>
            </div>
            <div className="group hover:bg-blue-50 p-6 rounded-xl transition-colors">
              <div className="bg-blue-100 p-4 rounded-full w-fit mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Enterprise Security</h3>
              <p className="text-gray-600">
                Bank-level encryption and advanced permissions keep your data safe and secure.
              </p>
            </div>
            <div className="group hover:bg-blue-50 p-6 rounded-xl transition-colors">
              <div className="bg-blue-100 p-4 rounded-full w-fit mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Version History</h3>
              <p className="text-gray-600">
                Track changes, restore previous versions, and never lose your work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}