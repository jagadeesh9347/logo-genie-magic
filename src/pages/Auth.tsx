
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (!isLogin) {
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[90%] md:max-w-md p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Logo Genie</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium" 
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
          
          <p className="text-center mt-4 text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary ml-2 hover:underline font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
