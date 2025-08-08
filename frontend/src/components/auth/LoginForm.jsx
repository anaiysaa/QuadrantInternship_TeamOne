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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try backend login with username and password
      const result = await login(username, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the portal!",
          variant: "default",
        });
        // Optionally redirect here, if not handled by ProtectedRoute
      } else {
        toast({
          title: "Login Failed",
          description:
            result.error ||
            "Invalid username or password.",
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
    >
      <video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover z-0"
  style={{ objectFit: "cover" }}
  ref={(video) => {
    if (video) {
      video.playbackRate = 0.75;
    }
  }}
>
  <source src="/public/ocean.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

      <Card className="w-full max-w-md z-20 bg-black/70 backdrop-blur-md shadow-xl border border-gray-700 text-white">

        <CardHeader className="text-center">
          <img
            src="/WorkName.png"
            className="h-16 mx-auto mb-4"
          />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-100">Username</Label>
              <Input
  id="username"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter your username"
  required
  autoComplete="username"
  className="bg-gray-800 text-blue-400 placeholder-gray-400 border-gray-700"
/>

            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-100">Password</Label >
              <Input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  required
  autoComplete="current-password"
  className="bg-gray-800 text-blue-400 placeholder-gray-400 border-gray-700"
/>
            </div>
            <Button type="submit" className="w-full text-blue-100 bg-[#5c8cb4]" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Label htmlFor="username" className="text-blue-100 mt-4 block cursor-pointer hover:underline">
  Forgot Password?
</Label>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
