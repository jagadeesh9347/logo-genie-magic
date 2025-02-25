
import { LogoGenie } from "@/components/LogoGenie";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserCircle, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Logo Genie</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 px-2">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
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
