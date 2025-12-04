import React from 'react';
import { UserProfile } from '../types';
import { Camera, ArrowRight, User, Shirt, Image as ImageIcon } from 'lucide-react';

interface LandingPageProps {
   onStart: () => void;
   user: UserProfile | null;
   onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, user, onOpenAuth }) => {
   return (
      <div className="min-h-screen bg-white font-sans text-stone-900">

         {/* Hero Section */}
         <section className="bg-[#0a0a0a] text-white pt-6 pb-20 lg:pb-32 relative overflow-hidden">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-20 mb-16 lg:mb-24">
               <div className="flex items-center space-x-2">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="font-medium text-lg tracking-tight">Outfit AI Studio</span>
               </div>

               <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-300">
                  <a href="#features" className="hover:text-white transition-colors">Features</a>
                  <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
               </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
               <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
                  Revolutionize Ecommerce <br className="hidden lg:block" />
                  Product Photography with AI
               </h1>
               <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Professional B2B SaaS for generating high-quality model and flat lay photos.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                     onClick={user ? onStart : onOpenAuth}
                     className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm hover:bg-stone-100 transition-colors min-w-[180px]"
                  >
                     {user ? 'Open Studio' : 'Get 10 Free Credits'}
                  </button>
                  <button className="text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors min-w-[180px]">
                     Watch Demo
                  </button>
               </div>
            </div>

            {/* Background Gradient Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 blur-[120px] rounded-full -z-0 pointer-events-none"></div>
         </section>

         {/* Feature Cards Section */}
         <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid lg:grid-cols-3 gap-6">

                  {/* Card 1: AI Model Generator (Dark) */}
                  <div className="bg-[#0a0a0a] text-white rounded-[2rem] p-8 lg:p-10 flex flex-col h-full relative overflow-hidden group">
                     <div className="mb-8">
                        <div className="w-12 h-12 bg-stone-800 rounded-2xl flex items-center justify-center mb-6">
                           <User className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">AI Model <br /> Generator</h3>
                        <p className="text-stone-400 text-sm leading-relaxed mb-6">
                           Complete AI model generator with automatic generation model and values in minutes and comprous vellu tox AI.
                        </p>
                     </div>

                     <div className="mt-auto grid grid-cols-3 gap-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" className="rounded-lg aspect-[3/4] object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Model 1" />
                        <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop" className="rounded-lg aspect-[3/4] object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Model 2" />
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" className="rounded-lg aspect-[3/4] object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Model 3" />
                     </div>
                  </div>

                  {/* Card 2: Virtual Try-On (Light) */}
                  <div className="bg-stone-50 rounded-[2rem] p-8 lg:p-10 flex flex-col h-full relative overflow-hidden">
                     <div className="mb-8">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                           <Shirt className="w-6 h-6 text-stone-900" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">Virtual Try-On</h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                           Virtual Try-On, allowman designs to iproach liw model oaimt, and late your photography orior quality photos.
                           Meniess your model em on your promotions cowtion.
                        </p>
                     </div>
                     <div className="mt-auto relative h-48 rounded-xl overflow-hidden bg-white border border-stone-100">
                        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover object-top" alt="Virtual Try On" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
                              <ArrowRight className="w-4 h-4 text-stone-900" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Card 3: Flat Lay Studio (Light) */}
                  <div className="bg-stone-50 rounded-[2rem] p-8 lg:p-10 flex flex-col h-full relative overflow-hidden">
                     <div className="mb-8">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                           <ImageIcon className="w-6 h-6 text-stone-900" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">Flat Lay Studio</h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                           Trade quitle loulls yroy and flat lay, ntudet, and flat lay photos, or more creating comenits photographis.
                        </p>
                     </div>
                     <div className="mt-auto">
                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop" className="w-full h-48 object-cover rounded-xl shadow-sm" alt="Flat Lay" />
                     </div>
                  </div>

               </div>
            </div>
         </section>

         {/* Pricing Section */}
         <section id="pricing" className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6 text-center">
               <h2 className="text-3xl font-semibold mb-4">Business-Friendly Pricing.</h2>
               <p className="text-xl text-stone-500 mb-2">1 Credit = 1 Image Generation.</p>
               <p className="text-xl text-stone-500 mb-10">Only $0.055 per image.<br />Start with 10 Free Credits.</p>

               <button
                  onClick={user ? onStart : onOpenAuth}
                  className="bg-[#0a0a0a] text-white px-10 py-4 rounded-full font-medium text-sm hover:bg-stone-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
               >
                  Sign Up Now
               </button>
            </div>
         </section>

         {/* Footer */}
         <footer className="bg-stone-50 py-16 border-t border-stone-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="col-span-1">
                     <h4 className="font-bold text-stone-900 mb-6">Outfit AI Studio</h4>
                  </div>
                  <div>
                     <h4 className="font-semibold text-stone-900 mb-4 text-sm">Business</h4>
                     <ul className="space-y-3 text-sm text-stone-500">
                        <li><a href="#" className="hover:text-stone-900">Features</a></li>
                        <li><a href="#" className="hover:text-stone-900">Legal camors</a></li>
                        <li><a href="#" className="hover:text-stone-900">Pricing</a></li>
                        <li><a href="#" className="hover:text-stone-900">Carpios AI</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold text-stone-900 mb-4 text-sm">About</h4>
                     <ul className="space-y-3 text-sm text-stone-500">
                        <li><a href="#" className="hover:text-stone-900">Pricing</a></li>
                        <li><a href="#" className="hover:text-stone-900">Terms</a></li>
                        <li><a href="#" className="hover:text-stone-900">Terms of use</a></li>
                        <li><a href="#" className="hover:text-stone-900">Contact</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold text-stone-900 mb-4 text-sm">Contact</h4>
                     <ul className="space-y-3 text-sm text-stone-500">
                        <li>(231) 555-7280</li>
                        <li>outfit.studio@gmail.com</li>
                     </ul>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
};