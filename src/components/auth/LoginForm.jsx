import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Login form submitted", {
      email: email.trim(),
      hasPassword: !!password,
    });

    try {
      const success = await login(email, password);
      console.log("Login result:", success);

      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the portal!",
          variant: "default",
        });
      } else {
        toast({
          title: "Login Failed",
          description:
            "Invalid email or password. Try 'password123' for any user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/login-bg.png')",
      }}
    >
      <Card className="w-full max-w-md backdrop-blur-md bg-white/80 shadow-xl border border-gray-200">
        <CardHeader className="text-center">
          <img
            src="/mentura-logo.png"
            alt="Menture Logo"
            className="h-16 mx-auto mb-4"
          />
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1">
              <p>
                <strong>Employee:</strong> john.employee@company.com
              </p>
              <p>
                <strong>HR:</strong> sarah.hr@company.com
              </p>
              <p>
                <strong>IT:</strong> mike.it@company.com
              </p>
              <p>
                <strong>Admin:</strong> admin@company.com
              </p>
              <p className="mt-2 font-medium text-primary">
                Password: password123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
