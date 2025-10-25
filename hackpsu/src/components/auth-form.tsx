"use client";

import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Eye, EyeOff, Mail, Lock, User, Apple} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import {useAuth} from "@/lib/auth-context";
import {toast} from "sonner";

interface AuthFormProps {
    onSuccess?: () => void;
}

export function AuthForm({onSuccess}: AuthFormProps) {
    const {signIn, signUp, signInWithGoogle, signInWithApple} = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const {error} = await signIn(formData.email, formData.password);

                if (error) throw error;
                toast.success("Successfully signed in!");
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords don't match");
                }

                const {error} = await signUp(formData.email, formData.password, formData.fullName);

                if (error) throw error;
                toast.success("Check your email for verification link!");
            }

            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const {error} = await signInWithGoogle();

            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || "Google authentication failed");
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                    {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                <CardDescription className="text-center">
                    {isLogin
                        ? "Enter your credentials to sign in"
                        : "Enter your details to create an account"
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Auth Mode Toggle */}
                <div className="flex items-center justify-center">
                    <ToggleGroup
                        type="single"
                        value={isLogin ? "login" : "signup"}
                        onValueChange={(value) => setIsLogin(value === "login")}
                        className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg"
                    >
                        <ToggleGroupItem
                            value="login"
                            className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm font-medium"
                        >
                            Sign In
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="signup"
                            className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm font-medium"
                        >
                            Sign Up
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Social Auth Buttons */}
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full"/>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="fullName"
                                initial={{opacity: 0, height: 0}}
                                animate={{opacity: 1, height: "auto"}}
                                exit={{opacity: 0, height: 0}}
                                transition={{duration: 0.2}}
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="pl-10 pr-10"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4"/>
                                ) : (
                                    <Eye className="h-4 w-4"/>
                                )}
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="confirmPassword"
                                initial={{opacity: 0, height: 0}}
                                animate={{opacity: 1, height: "auto"}}
                                exit={{opacity: 0, height: 0}}
                                transition={{duration: 0.2}}
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                    </Button>
                </form>

                {isLogin && (
                    <div className="text-center">
                        <Button variant="link" className="text-sm text-muted-foreground">
                            Forgot your password?
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
