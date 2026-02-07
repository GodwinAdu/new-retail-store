"use client"

import Link from "next/link";
import { ShoppingCart, Package, BarChart3, Users, Sparkles, Shield, Zap, Globe } from "lucide-react";
import SignupForm from "./_components/SignupForm";
import { motion } from "framer-motion";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <motion.div 
                    className="absolute top-10 left-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-500/15 rounded-full blur-2xl"
                    animate={{
                        x: [-80, 80, -80],
                        y: [-40, 40, -40],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex">
                {/* Left Side - Enhanced Branding */}
                <motion.div 
                    className="lg:w-1/2 flex items-center justify-center p-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-center space-y-8 max-w-lg">
                        {/* Logo with Animation */}
                        <motion.div 
                            className="flex items-center justify-center space-x-4"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <ShoppingCart className="w-10 h-10 text-white" />
                                </div>
                                <motion.div 
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-3 h-3 text-yellow-800" />
                                </motion.div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">RetailPOS</h1>
                                <p className="text-blue-400 font-medium">Professional Management</p>
                            </div>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h2 className="text-5xl font-bold text-white leading-tight">
                                Start Your
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    {" "}Retail Journey
                                </span>
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Join thousands of retailers using our platform to revolutionize their operations and maximize profits.
                            </p>
                        </motion.div>

                        {/* Feature Grid */}
                        <motion.div 
                            className="grid grid-cols-2 gap-4 mt-12"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <ShoppingCart className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2 text-sm">Complete POS</h3>
                                <p className="text-xs text-gray-300">Full-featured point of sale</p>
                            </motion.div>
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Package className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2 text-sm">Inventory</h3>
                                <p className="text-xs text-gray-300">Smart stock management</p>
                            </motion.div>
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2 text-sm">Customer Management</h3>
                                <p className="text-xs text-gray-300">Efficient customer tracking</p>
                            </motion.div>
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2 text-sm">Analytics</h3>
                                <p className="text-xs text-gray-300">Detailed insights</p>
                            </motion.div>
                        </motion.div>

                        {/* Benefits List */}
                        <motion.div 
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mt-8 border border-white/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <h3 className="font-bold text-white mb-4 text-center">What's Included:</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>Unlimited products</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span>Multi-branch support</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span>Staff management</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <span>30-day free trial</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Signup Form */}
                <motion.div 
                    className="lg:w-1/2 flex items-center justify-center p-8"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="w-full max-w-2xl space-y-6">
                        <SignupForm />
                        
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-300">
                                Already have an account?{" "}
                                <Link 
                                    href="/sign-in" 
                                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </p>
                            <p className="text-xs text-gray-400">
                                By creating an account, you agree to our{" "}
                                <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}