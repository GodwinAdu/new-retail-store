"use client"

import Link from "next/link";
import { ShoppingCart, Package, Sparkles, Shield, Zap } from "lucide-react";
import LoginForm from "./_components/LoginForm";
import { motion } from "framer-motion";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <motion.div 
                    className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl"
                    animate={{
                        x: [-100, 100, -100],
                        y: [-50, 50, -50],
                    }}
                    transition={{
                        duration: 15,
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
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <ShoppingCart className="w-10 h-10 text-white" />
                                </div>
                                <motion.div 
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-3 h-3 text-yellow-800" />
                                </motion.div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white">RetailPOS</h1>
                                <p className="text-green-400 font-medium">Smart Retail Management</p>
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
                                Welcome Back to the
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                                    {" "}Future of Retail
                                </span>
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Experience the next generation of retail management with AI-powered insights and seamless operations.
                            </p>
                        </motion.div>

                        {/* Feature Cards */}
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Package className="w-10 h-10 text-green-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2">Smart Inventory</h3>
                                <p className="text-sm text-gray-300">AI-powered stock management</p>
                            </motion.div>
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Shield className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2">Secure</h3>
                                <p className="text-sm text-gray-300">Enterprise-grade security</p>
                            </motion.div>
                            <motion.div 
                                className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                                <h3 className="font-bold text-white mb-2">Lightning Fast</h3>
                                <p className="text-sm text-gray-300">Real-time synchronization</p>
                            </motion.div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div 
                            className="flex justify-center space-x-8 pt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">25K+</div>
                                <div className="text-green-400 text-sm">Retailers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99.9%</div>
                                <div className="text-blue-400 text-sm">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <div className="text-yellow-400 text-sm">Support</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div 
                    className="lg:w-1/2 flex items-center justify-center p-8"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <div className="w-full max-w-md space-y-6">
                        <LoginForm />
                        
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-300">
                                Don't have an account?{" "}
                                <Link 
                                    href="/sign-up" 
                                    className="font-semibold text-green-400 hover:text-green-300 transition-colors"
                                >
                                    Sign up for free
                                </Link>
                            </p>
                            <p className="text-xs text-gray-400">
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="text-green-400 hover:text-green-300 underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-green-400 hover:text-green-300 underline">
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