"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: "" }));
        if (error) setError("");
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
    };

    const validateField = (field: string) => {
        const errors: Record<string, string> = {};
        if (field === "email") {
            if (!formData.email) errors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address";
        }
        if (field === "password") {
            if (!formData.password) errors.password = "Password is required";
        }
        setFieldErrors(prev => ({ ...prev, ...errors, ...(Object.keys(errors).length === 0 ? { [field]: "" } : {}) }));
    };

    const validateAll = () => {
        setTouched({ email: true, password: true });
        const errors: Record<string, string> = {};

        if (!formData.email) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email address";

        if (!formData.password) errors.password = "Password is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateAll()) return;

        setIsLoading(true);
        try {
            const result = await signIn(formData);
            if (result.success && result.redirectUrl) {
                toast.success("Login successful! Redirecting...");
                router.push(result.redirectUrl);
            } else {
                const msg = result.error || "Invalid email or password";
                setError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            const msg = err.message || "An unexpected error occurred";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const FieldError = ({ field }: { field: string }) => {
        if (!touched[field] || !fieldErrors[field]) return null;
        return (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{fieldErrors[field]}
            </motion.p>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-300">Sign in to your retail store</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur("email")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${touched.email && fieldErrors.email ? "border-red-500/50" : ""}`} placeholder="your@email.com" />
                                </div>
                                <FieldError field="email" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} onBlur={() => handleBlur("password")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10 ${touched.password && fieldErrors.password ? "border-red-500/50" : ""}`} placeholder="Enter your password" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <FieldError field="password" />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing In...</>
                            ) : (
                                "Sign In to Your Store"
                            )}
                        </Button>

                        <div className="text-center">
                            <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                Forgot your password?
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
