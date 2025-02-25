
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
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

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
        });
        
        if (error) throw error;
        
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms'
        });

        if (error) throw error;

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

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <form onSubmit={handleEmailAuth} className="space-y-4">
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
          </TabsContent>

          <TabsContent value="phone">
            <form onSubmit={handlePhoneAuth} className="space-y-4">
              {!otpSent ? (
                <div>
                  <Input
                    type="tel"
                    placeholder="Phone Number (e.g., +1234567890)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Enter the code sent to {phoneNumber}
                  </p>
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    maxLength={6}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium" 
                disabled={loading}
              >
                {loading ? "Loading..." : otpSent ? "Verify Code" : "Send Code"}
              </Button>
              {otpSent && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setOtpSent(false)}
                >
                  Change Phone Number
                </Button>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
