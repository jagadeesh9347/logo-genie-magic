
import { LogoGenie } from "@/components/LogoGenie";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Logo Genie</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            <span>{user?.email}</span>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <LogoGenie />
    </div>
  );
};

export default Dashboard;
