"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Store, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/actions/auth.actions";

export default function SignupForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        storeName: "",
        storeEmail: "",
        storePhone: "",
        storeAddress: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signUp(formData);
            if (result.success) {
                router.push(result.redirectUrl);
            }
        } catch (error: any) {
            setError(error.message || "An error occurred during signup");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">
                        Create Your Retail Store
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                        Start your 30-day free trial today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-white">
                                <User className="w-5 h-5" />
                                <h3 className="font-semibold">Personal Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="Your phone number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Store Information */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-white">
                                <Store className="w-5 h-5" />
                                <h3 className="font-semibold">Store Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName" className="text-gray-300">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        name="storeName"
                                        type="text"
                                        required
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="Your store name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeEmail" className="text-gray-300">Store Email</Label>
                                    <Input
                                        id="storeEmail"
                                        name="storeEmail"
                                        type="email"
                                        required
                                        value={formData.storeEmail}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="store@business.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storePhone" className="text-gray-300">Store Phone</Label>
                                    <Input
                                        id="storePhone"
                                        name="storePhone"
                                        type="tel"
                                        value={formData.storePhone}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="Store contact number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeAddress" className="text-gray-300">Store Address</Label>
                                    <Input
                                        id="storeAddress"
                                        name="storeAddress"
                                        type="text"
                                        value={formData.storeAddress}
                                        onChange={handleInputChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        placeholder="Store location"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Your Store...
                                </>
                            ) : (
                                "Create Store & Start Free Trial"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}