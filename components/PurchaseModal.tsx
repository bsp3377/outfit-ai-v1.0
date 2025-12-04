import React, { useState } from 'react';
import { X, CheckCircle2, Zap, CreditCard, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { CreditPackage } from '../types';
import { authService } from '../services/authService';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPurchaseSuccess: (newBalance: number) => void;
}

const PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 4.99,
    features: ['50 Image Generations', 'Standard Speed', 'No Expiry']
  },
  {
    id: 'pro',
    name: 'Pro Value',
    credits: 120,
    price: 9.99,
    popular: true,
    features: ['120 Image Generations', 'Priority Processing', 'Commercial License']
  },
  {
    id: 'studio',
    name: 'Studio Power',
    credits: 500,
    price: 29.99,
    features: ['500 Image Generations', 'Top Priority', 'Commercial License', 'Bulk Generation']
  }
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, userId, onPurchaseSuccess }) => {
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Form State (Mock)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const handleSelect = (pkg: CreditPackage) => {
    setSelectedPkg(pkg);
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setIsProcessing(true);
    
    // Simulate Stripe processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const newBalance = await authService.purchaseCredits(userId, selectedPkg.credits);
      onPurchaseSuccess(newBalance);
      onClose();
      // Reset after close
      setTimeout(() => {
        setStep('select');
        setIsProcessing(false);
        setCardNumber('');
        setExpiry('');
        setCvc('');
      }, 500);
    } catch (error) {
      console.error("Purchase failed", error);
      alert("Purchase failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {step === 'select' ? (
          <div className="p-8 lg:p-12">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                Top Up Your Studio
              </h2>
              <p className="text-stone-500 dark:text-stone-400">
                Select a package to continue creating with Gemini 3 Pro.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col cursor-pointer
                    ${pkg.popular 
                      ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10 transform md:-translate-y-2 shadow-xl hover:shadow-2xl' 
                      : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg'
                    }
                  `}
                  onClick={() => handleSelect(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Best Value
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{pkg.name}</h3>
                    <div className="flex items-baseline justify-center mt-2">
                      <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">${pkg.price}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600 font-bold">
                      <Zap className="w-4 h-4 fill-emerald-600" />
                      <span>{pkg.credits} Credits</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-stone-600 dark:text-stone-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`
                      w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all
                      ${pkg.popular
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                      }
                    `}
                  >
                    <span>Select Plan</span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center space-x-4 grayscale opacity-50">
               {/* Mock Logos */}
               <div className="h-6 w-10 bg-stone-300 rounded"></div>
               <div className="h-6 w-10 bg-stone-300 rounded"></div>
               <div className="h-6 w-10 bg-stone-300 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-12 max-w-lg mx-auto">
             <div className="flex items-center mb-6">
               <button 
                 onClick={() => setStep('select')}
                 className="flex items-center text-sm text-stone-500 hover:text-stone-900 transition-colors"
               >
                 <span className="mr-1">←</span> Back
               </button>
             </div>
             
             <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl mb-8 flex justify-between items-center">
                <div>
                   <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">Selected Plan</p>
                   <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{selectedPkg?.name}</h3>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">${selectedPkg?.price}</p>
                   <p className="text-xs text-emerald-600 font-bold">+{selectedPkg?.credits} Credits</p>
                </div>
             </div>

             <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Card Information</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                        setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                      value={expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                        setExpiry(val);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">CVC</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-stone-400 justify-center py-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span>Payments secured by Stripe (Simulated)</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                       <span>Pay ${selectedPkg?.price}</span>
                    </>
                  )}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};
