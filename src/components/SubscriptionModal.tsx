import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShieldCheck, Sparkles, CreditCard, Loader2 } from 'lucide-react';
import { SubscriptionPlan, User } from '../types';
import { PLANS } from '../data/mockMovies';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSubscribe: (planId: string, planName: string) => void;
  onOpenAuth: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentUser,
  onSubscribe,
  onOpenAuth
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(PLANS[1]); // Default to Gold Plan
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onSubscribe(selectedPlan.id, selectedPlan.name);
    }, 2000);
  };

  const resetModal = () => {
    setStep('plans');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="subscription-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          id="subscription-modal-window"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-brand-elevation-1 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 text-slate-100 p-6 md:p-8"
        >
          {/* Close Button */}
          <button
            id="close-subscription-modal"
            onClick={resetModal}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {!currentUser ? (
            <div id="auth-prompt-view" className="text-center py-12 px-4 max-w-md mx-auto">
              <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-3 font-display tracking-wider uppercase">Unlock Unlimited Movies</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Log in or register an account to choose an abonnement subscription plan and unlock all blockbusters, personalized watchlists, and historic views!
              </p>
              <button
                id="subscription-btn-auth"
                onClick={() => {
                  resetModal();
                  onOpenAuth();
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-semibold rounded-2xl shadow-lg shadow-orange-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          ) : (
            <>
              {step === 'plans' && (
                <div id="plans-view">
                  <div className="text-center mb-8">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wider uppercase rounded-full border border-amber-500/20">
                      Streaming Abonnements
                    </span>
                    <h3 className="text-4xl font-extrabold mt-3 font-display tracking-wider uppercase">Choose Your Experience</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Unlock full unlimited movie streaming for 30 days. Cancel anytime.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {PLANS.map((plan) => {
                      const isSelected = selectedPlan.id === plan.id;
                      return (
                        <div
                          id={`plan-card-${plan.id}`}
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                            isSelected
                              ? 'bg-slate-950 border-amber-500 shadow-xl shadow-amber-950/20 scale-[1.03]'
                              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold uppercase rounded-full tracking-wider">
                              Selected
                            </span>
                          )}

                          <div>
                            <h4 className="text-2xl font-bold font-display tracking-wider uppercase mb-1">{plan.name}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">{plan.description}</p>
                            <div className="flex items-baseline gap-1 mb-6">
                              <span className="text-4xl font-black font-display tracking-wider">${plan.price}</span>
                              <span className="text-slate-400 text-xs font-sans">/ month</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            id={`select-plan-${plan.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlan(plan);
                              setStep('checkout');
                            }}
                            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            Get {plan.name}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center items-center gap-2 text-slate-400 text-xs bg-slate-950/50 p-4 rounded-xl max-w-md mx-auto border border-slate-800/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Secure 256-bit encrypted simulated credit card transactions.</span>
                  </div>
                </div>
              )}

              {step === 'checkout' && (
                <div id="checkout-view" className="max-w-md mx-auto py-4">
                  <div className="mb-6 text-center">
                    <button
                      id="back-to-plans"
                      onClick={() => setStep('plans')}
                      className="text-slate-400 hover:text-amber-400 text-xs font-semibold cursor-pointer mb-2 block mx-auto"
                    >
                      ← Back to Plans
                    </button>
                    <h3 className="text-2xl font-bold">Secure Simulation Payment</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Subscribing to <span className="text-amber-400 font-semibold">{selectedPlan.name}</span> for <span className="font-bold text-white">${selectedPlan.price}</span>
                    </p>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Simulated Card Name</label>
                      <input
                        id="card-name-input"
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Simulated Card Number</label>
                      <div className="relative">
                        <input
                          id="card-number-input"
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => {
                            // Format space every 4 digits
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          placeholder="4000 1234 5678 9010"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <CreditCard className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Expiration Date</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\//g, '');
                            if (val.length >= 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2);
                            }
                            setCardExpiry(val);
                          }}
                          placeholder="MM/YY"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">CVC Code</label>
                        <input
                          id="card-cvc-input"
                          type="password"
                          required
                          maxLength={3}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-center font-mono"
                        />
                      </div>
                    </div>

                    <button
                      id="submit-payment-btn"
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-700 font-semibold text-slate-950 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-orange-950/20"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Authorizing Simulation...</span>
                        </>
                      ) : (
                        <span>Pay ${selectedPlan.price} & Activate Abonnement</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {step === 'success' && (
                <div id="success-view" className="text-center py-12 px-4 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-sans tracking-tight">Welcome to VIP Cinema</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Abonnement payment mock verified. Your account has been upgraded to <span className="text-emerald-400 font-semibold">{selectedPlan.name}</span> for the next month! You can now watch all movies and trailers completely for free.
                  </p>
                  <button
                    id="finish-subscription-btn"
                    onClick={resetModal}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 font-semibold rounded-2xl transition-all cursor-pointer"
                  >
                    Start Watching Now
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
