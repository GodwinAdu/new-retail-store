"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Store, User, Mail, Phone, MapPin, Loader2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/actions/auth.actions";

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) },
    { label: "One special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function getStrength(password: string) {
    const passed = passwordRules.filter(r => r.test(password)).length;
    if (passed <= 1) return { level: "Weak", color: "bg-red-500", width: "w-1/5" };
    if (passed <= 2) return { level: "Fair", color: "bg-orange-500", width: "w-2/5" };
    if (passed <= 3) return { level: "Good", color: "bg-yellow-500", width: "w-3/5" };
    if (passed <= 4) return { level: "Strong", color: "bg-emerald-500", width: "w-4/5" };
    return { level: "Very Strong", color: "bg-green-400", width: "w-full" };
}

export default function SignupForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [confirmPassword, setConfirmPassword] = useState("");
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    const strength = useMemo(() => getStrength(formData.password), [formData.password]);

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        switch (field) {
            case "fullName":
                if (!formData.fullName.trim()) errors.fullName = "Full name is required";
                else if (formData.fullName.trim().length < 2) errors.fullName = "Name must be at least 2 characters";
                break;
            case "email":
                if (!formData.email) errors.email = "Email is required";
                else if (!emailRegex.test(formData.email)) errors.email = "Enter a valid email address";
                break;
            case "password":
                if (!formData.password) errors.password = "Password is required";
                else if (passwordRules.filter(r => r.test(formData.password)).length < 5) errors.password = "Password doesn't meet all requirements";
                break;
            case "confirmPassword":
                if (confirmPassword && confirmPassword !== formData.password) errors.confirmPassword = "Passwords do not match";
                break;
            case "storeName":
                if (!formData.storeName.trim()) errors.storeName = "Store name is required";
                break;
            case "storeEmail":
                if (!formData.storeEmail) errors.storeEmail = "Store email is required";
                else if (!emailRegex.test(formData.storeEmail)) errors.storeEmail = "Enter a valid store email";
                break;
        }

        setFieldErrors(prev => ({ ...prev, ...errors, ...(Object.keys(errors).length === 0 ? { [field]: "" } : {}) }));
        return Object.keys(errors).length === 0;
    };

    const validateAll = () => {
        const fields = ["fullName", "email", "password", "confirmPassword", "storeName", "storeEmail"];
        const allTouched: Record<string, boolean> = {};
        fields.forEach(f => allTouched[f] = true);
        setTouched(allTouched);

        let valid = true;
        const errors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.fullName.trim()) { errors.fullName = "Full name is required"; valid = false; }
        else if (formData.fullName.trim().length < 2) { errors.fullName = "Name must be at least 2 characters"; valid = false; }

        if (!formData.email) { errors.email = "Email is required"; valid = false; }
        else if (!emailRegex.test(formData.email)) { errors.email = "Enter a valid email address"; valid = false; }

        if (!formData.password) { errors.password = "Password is required"; valid = false; }
        else if (passwordRules.filter(r => r.test(formData.password)).length < 5) { errors.password = "Password doesn't meet all requirements"; valid = false; }

        if (!confirmPassword) { errors.confirmPassword = "Please confirm your password"; valid = false; }
        else if (confirmPassword !== formData.password) { errors.confirmPassword = "Passwords do not match"; valid = false; }

        if (!formData.storeName.trim()) { errors.storeName = "Store name is required"; valid = false; }

        if (!formData.storeEmail) { errors.storeEmail = "Store email is required"; valid = false; }
        else if (!emailRegex.test(formData.storeEmail)) { errors.storeEmail = "Enter a valid store email"; valid = false; }

        setFieldErrors(errors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateAll()) return;

        setIsLoading(true);
        try {
            const result = await signUp(formData);
            if (result.success && result.redirectUrl) {
                router.push(result.redirectUrl);
            } else {
                setError(result.error || "An error occurred during signup");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
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
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Create Your Retail Store</CardTitle>
                    <CardDescription className="text-gray-300">Start your 30-day free trial today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                                    <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} onBlur={() => handleBlur("fullName")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${touched.fullName && fieldErrors.fullName ? "border-red-500/50" : ""}`} placeholder="Enter your full name" />
                                    <FieldError field="fullName" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                                    <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="Your phone number" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur("email")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${touched.email && fieldErrors.email ? "border-red-500/50" : ""}`} placeholder="your@email.com" />
                                    <FieldError field="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <div className="relative">
                                        <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} onBlur={() => handleBlur("password")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${touched.password && fieldErrors.password ? "border-red-500/50" : ""}`} placeholder="Create a strong password" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password strength bar */}
                                    {formData.password && (
                                        <div className="space-y-2 mt-2">
                                            <div className="flex items-center justify-between">
                                                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden mr-3">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className={`h-full ${strength.color} ${strength.width} rounded-full transition-all duration-300`} />
                                                </div>
                                                <span className={`text-xs font-medium ${strength.color.replace("bg-", "text-")}`}>{strength.level}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {passwordRules.map((rule, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 text-xs">
                                                        {rule.test(formData.password) ? (
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                        ) : (
                                                            <X className="w-3 h-3 text-gray-500" />
                                                        )}
                                                        <span className={rule.test(formData.password) ? "text-emerald-400" : "text-gray-500"}>{rule.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                                    <div className="relative">
                                        <Input id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: "" })); }} onBlur={() => handleBlur("confirmPassword")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${touched.confirmPassword && fieldErrors.confirmPassword ? "border-red-500/50" : ""}`} placeholder="Re-enter your password" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <FieldError field="confirmPassword" />
                                    {touched.confirmPassword && confirmPassword && confirmPassword === formData.password && !fieldErrors.confirmPassword && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                                            <Check className="w-3 h-3" />Passwords match
                                        </motion.p>
                                    )}
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
                                    <Input id="storeName" name="storeName" type="text" value={formData.storeName} onChange={handleInputChange} onBlur={() => handleBlur("storeName")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${touched.storeName && fieldErrors.storeName ? "border-red-500/50" : ""}`} placeholder="Your store name" />
                                    <FieldError field="storeName" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeEmail" className="text-gray-300">Store Email</Label>
                                    <Input id="storeEmail" name="storeEmail" type="email" value={formData.storeEmail} onChange={handleInputChange} onBlur={() => handleBlur("storeEmail")} className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${touched.storeEmail && fieldErrors.storeEmail ? "border-red-500/50" : ""}`} placeholder="store@business.com" />
                                    <FieldError field="storeEmail" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storePhone" className="text-gray-300">Store Phone</Label>
                                    <Input id="storePhone" name="storePhone" type="tel" value={formData.storePhone} onChange={handleInputChange} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="Store contact number" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeAddress" className="text-gray-300">Store Address</Label>
                                    <Input id="storeAddress" name="storeAddress" type="text" value={formData.storeAddress} onChange={handleInputChange} className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" placeholder="Store location" />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Your Store...</>
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
