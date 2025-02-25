
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
        });
        
        if (error) throw error;
        
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
        });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
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
            Sign in with Magic Link
          </h2>
          <p className="text-gray-600 mt-2">
            No password needed - we'll send you a login code
          </p>
        </div>

        <form onSubmit={handleEmailOTP} className="space-y-6">
          {!otpSent ? (
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Enter the code sent to {email}
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
            {loading ? "Loading..." : otpSent ? "Verify Code" : "Send Magic Link"}
          </Button>
          
          {otpSent && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setOtpSent(false)}
            >
              Change Email
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default Auth;
