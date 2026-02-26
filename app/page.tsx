"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Clock,
  Shield,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Layers,
  Infinity as InfinityIcon,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Particle system component
const ParticleSystem = () => {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; opacity: number }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-emerald-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [
              particle.opacity,
              particle.opacity * 0.3,
              particle.opacity,
            ],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated counter component
const AnimatedCounter = ({
  end,
  duration = 2,
}: {
  end: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(
          (currentTime - startTime) / (duration * 1000),
          1
        );
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900 relative overflow-hidden">
      <ParticleSystem />
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                  <Zap className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  QounterPay
                </span>
                <div className="text-xs text-emerald-600">
                  Professional Management
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-emerald-600 to-slate-700 hover:from-emerald-700 hover:to-slate-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Complete Retail
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-amber-500">
                  {" "}
                  Management System
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Streamline your retail operations with our comprehensive POS
                system. Manage inventory, sales, customers, and analytics all in
                one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-slate-700 hover:from-emerald-700 hover:to-slate-800 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 hover:bg-emerald-50 transition-all"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <motion.div 
              className="relative h-96 lg:h-[600px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="relative w-full max-w-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  {/* Main Dashboard Screen */}
                  <div className="relative bg-gradient-to-br from-slate-900 to-gray-900 rounded-3xl p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-amber-500/10 rounded-3xl" />
                    
                    {/* Screen Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      </div>
                      <div className="text-xs text-gray-400 font-mono">QounterPay Dashboard</div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="space-y-4">
                      {/* KPI Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <motion.div 
                          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl p-3 border border-emerald-500/30"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                        >
                          <div className="text-emerald-400 text-xs mb-1">Revenue</div>
                          <div className="text-white font-bold text-lg">$47.2K</div>
                          <div className="text-emerald-300 text-xs">+12.5%</div>
                        </motion.div>
                        <motion.div 
                          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl p-3 border border-amber-500/30"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                        >
                          <div className="text-amber-400 text-xs mb-1">Orders</div>
                          <div className="text-white font-bold text-lg">2,847</div>
                          <div className="text-amber-300 text-xs">+8.2%</div>
                        </motion.div>
                        <motion.div 
                          className="bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl p-3 border border-slate-500/30"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
                        >
                          <div className="text-slate-400 text-xs mb-1">Products</div>
                          <div className="text-white font-bold text-lg">1,249</div>
                          <div className="text-slate-300 text-xs">Active</div>
                        </motion.div>
                      </div>
                      
                      {/* Sales Chart */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-white text-sm font-medium">Sales Analytics</div>
                          <div className="text-emerald-400 text-xs">Live</div>
                        </div>
                        <div className="flex items-end space-x-1 h-16">
                          {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95].map((height, i) => (
                            <motion.div
                              key={i}
                              className="bg-gradient-to-t from-emerald-500 to-amber-500 rounded-sm flex-1"
                              style={{ height: `${height}%` }}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1, delay: i * 0.1 + 1.5 }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Recent Transactions */}
                      <div className="space-y-2">
                        <div className="text-white text-sm font-medium mb-2">Recent Transactions</div>
                        {[
                          { item: "iPhone 15 Pro", amount: "$999", status: "completed" },
                          { item: "MacBook Air", amount: "$1,299", status: "pending" },
                          { item: "AirPods Pro", amount: "$249", status: "completed" }
                        ].map((transaction, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 2 + i * 0.2 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                transaction.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`} />
                              <div className="text-gray-300 text-xs">{transaction.item}</div>
                            </div>
                            <div className="text-white text-xs font-medium">{transaction.amount}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Action Buttons */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-2xl"
                    animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  >
                    <BarChart3 className="w-5 h-5 text-white" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-1/2 -right-6 w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center shadow-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                  >
                    <TrendingUp className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Background Effects */}
              <motion.div 
                className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-amber-400/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div 
                className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-slate-500/20 to-emerald-500/20 rounded-full blur-2xl"
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
              />
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
              <div className="text-4xl font-black text-cyan-400 mb-2">
                <AnimatedCounter end={50000} />+
              </div>
              <div className="text-gray-300 font-medium">Happy Retailers</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-4xl font-black text-blue-400 mb-2">
                <AnimatedCounter end={2500} />+
              </div>
              <div className="text-gray-300 font-medium">Store Locations</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-300">
              <div className="text-4xl font-black text-green-400 mb-2">
                <AnimatedCounter end={99} />
                .9%
              </div>
              <div className="text-gray-300 font-medium">Uptime SLA</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="text-4xl font-black text-purple-400 mb-2">
                $<AnimatedCounter end={2} />
                B+
              </div>
              <div className="text-gray-300 font-medium">Processed</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full border border-cyan-500/20 mb-8"
            >
              <Layers className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-medium">
                Complete Retail Ecosystem
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Everything Your
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Business Needs
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              From AI-powered analytics to seamless integrations, our platform
              provides enterprise-grade tools designed for modern retail
              success.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-cyan-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <ShoppingCart className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                Smart POS
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                AI-powered point of sale with lightning-fast checkout,
                intelligent inventory sync, and seamless payment processing.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  <span>Instant barcode scanning</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  <span>50+ payment methods</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  <span>Dynamic pricing & promotions</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-purple-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                AI Inventory
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Predictive inventory management with automated reordering,
                demand forecasting, and multi-location sync.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span>Real-time stock tracking</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span>Predictive reordering</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span>Supplier automation</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-green-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                Customer 360°
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Complete customer intelligence with behavioral analytics,
                personalized experiences, and automated loyalty programs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>360° customer profiles</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Smart loyalty rewards</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Behavioral insights</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-orange-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <BarChart3 className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                Smart Analytics
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                AI-driven business intelligence with predictive analytics,
                real-time dashboards, and automated insights.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0" />
                  <span>Predictive analytics</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0" />
                  <span>Real-time dashboards</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0" />
                  <span>Automated insights</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-red-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Clock className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                Team Hub
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Complete workforce management with intelligent scheduling,
                performance tracking, and role-based access control.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <span>Smart scheduling</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <span>Performance insights</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <span>Access management</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-indigo-500/30 transition-all duration-500 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-indigo-500/25"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Globe className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                Enterprise Scale
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Unlimited scalability with multi-location management,
                centralized control, and enterprise-grade security.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                  <span>Unlimited locations</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                  <span>Centralized control</span>
                </li>
                <li className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                  <CheckCircle className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                  <span>Enterprise security</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full border border-emerald-500/20 mb-8"
            >
              <Zap className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="text-emerald-300 font-medium">
                Simple, Transparent Pricing
              </span>
            </motion.div>

            <motion.h2
              className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-amber-500 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Simple pay-as-you-use pricing. Only pay for the branches you need.
              All plans include a 30-day free trial.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Pay-As-You-Go Plan - Most Popular */}
            <motion.div
              className="relative bg-gradient-to-br from-white/10 to-white/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-emerald-500/50 hover:border-emerald-400/70 transition-all duration-500 scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.07 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-8 mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pay-As-You-Go</h3>
                <p className="text-gray-400">Perfect for any size retail business</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-5xl font-black text-emerald-400 mb-2">
                  ₵80
                  <span className="text-lg text-gray-400 font-normal">/branch/month</span>
                </div>
                <p className="text-gray-400">Simple per-branch pricing</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>₵80 per store per month</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>Complete POS system</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>Inventory management</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>Customer management</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                  <span>Email & chat support</span>
                </li>
              </ul>

              <Link href="/sign-up">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-2xl">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-slate-500/30 transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-gray-400">For large retail chains</p>
              </div>
              
              <div className="text-center mb-8">
                <div className="text-5xl font-black text-slate-400 mb-2">
                  Custom
                  <span className="text-lg text-gray-400 font-normal"> pricing</span>
                </div>
                <p className="text-gray-400">Volume discounts available</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>Volume discounts available</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>24/7 phone support</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>API access</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                  <span>Priority feature requests</span>
                </li>
              </ul>

              <Link href="/contact">
                <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 rounded-xl">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Additional Features */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">All Plans Include</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">SSL Security</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">99.9% Uptime</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">Cloud Backup</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-medium">Free Updates</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
          >
            <InfinityIcon className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium">
              Unlimited Potential Awaits
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Dominate Retail?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join 50,000+ retailers who've already transformed their business
            with our next-generation platform. Start your journey to retail
            excellence today.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/sign-up">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(255, 255, 255, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-6 rounded-2xl shadow-2xl font-bold"
                >
                  Start Free Trial
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-6 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-bold"
              >
                <Play className="w-6 h-6 mr-3" />
                Book Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 text-white/80"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="font-semibold">30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-yellow-400" />
              <span className="font-semibold">24/7 support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="md:col-span-2">
              <motion.div
                className="flex items-center space-x-4 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                    <Zap className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    QounterPay
                  </span>
                  <div className="text-sm text-emerald-400 font-medium">
                    Next-Gen Retail Platform
                  </div>
                </div>
              </motion.div>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                Empowering retailers worldwide with cutting-edge technology,
                intelligent insights, and seamless operations.
              </p>
              <div className="flex space-x-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center cursor-pointer border border-white/10 hover:border-cyan-500/30"
                    whileHover={{
                      scale: 1.2,
                      backgroundColor: "rgba(6, 182, 212, 0.1)",
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl text-cyan-400">Platform</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#mobile-pos"
                    className="text-gray-300 hover:text-emerald-400 transition-colors font-medium flex items-center"
                  >
                    Mobile POS
                    <span className="ml-2 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                      React Native
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="#demo"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="#integrations"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl text-blue-400">Company</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#about"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#careers"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#support"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 font-medium">
              © {new Date().getFullYear()} QounterPay. All rights reserved.
              <span className="text-cyan-400">
                Built for the future of retail.
              </span>
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link
                href="#privacy"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Privacy
              </Link>
              <Link
                href="#terms"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Terms
              </Link>
              <Link
                href="#cookies"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cookies
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
