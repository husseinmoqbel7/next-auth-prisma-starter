import LoginButton from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe, Key, Lock, ShieldCheck, Star, Users, Zap } from "lucide-react";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const features = [
  {
    icon: Lock,
    title: "Robust Authentication",
    description: "Next-auth v5 with Credentials & OAuth Providers",
  },
  {
    icon: ShieldCheck,
    title: "Advanced Security",
    description: "2FA, Email Verification, Forgot Password",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Admin & User Roles, Role-Based Access Control",
  },
  {
    icon: Globe,
    title: "Access Control",
    description: "Secure API Routes, Server Actions, Role Gate",
  },
  {
    icon: Zap,
    title: "Authentication UI",
    description: "Login, Logout, Register, Verification Components",
  },
  {
    icon: Key,
    title: "Extensibility",
    description: "Custom Hooks, Middleware, Session Management",
  },
];

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-purple-800">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          Auth JS 🔐
        </h1>
        <h3 className="text-white text-lg">
          A simple authentication service for your Next.js app 🚀
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 p-4 rounded-lg text-center 
                     transition-all duration-300 
                     hover:bg-white/20 hover:scale-105"
            >
              <feature.icon className="mx-auto mb-2 w-8 h-8 text-white/80" />
              <h3 className="text-sm font-semibold text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-x-3 ">
          <LoginButton asChild>
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
          <Button variant="default" size="lg">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Star on GitHub</span>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Home;
