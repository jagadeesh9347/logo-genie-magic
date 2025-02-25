import { useState } from 'react';
import { 
  Building2, Brush, Download, Image, Mic, Palette, Search, Settings, ShoppingBag, 
  Laptop, Utensils, Camera, Car, Hospital, Gamepad, Book, Music, Plane, Home, 
  Heart, Dumbbell, Coffee, Film, Globe, TreePalm 
} from 'lucide-react';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLogoGeneration } from "@/hooks/useLogoGeneration";

const industries = [
  { id: 'tech', name: 'Technology', icon: Laptop },
  { id: 'retail', name: 'Retail', icon: ShoppingBag },
  { id: 'business', name: 'Business', icon: Building2 },
  { id: 'restaurant', name: 'Restaurant', icon: Utensils },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'automotive', name: 'Automotive', icon: Car },
  { id: 'healthcare', name: 'Healthcare', icon: Hospital },
  { id: 'gaming', name: 'Gaming', icon: Gamepad },
  { id: 'education', name: 'Education', icon: Book },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'travel', name: 'Travel', icon: Plane },
  { id: 'realestate', name: 'Real Estate', icon: Home },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell },
  { id: 'beauty', name: 'Beauty', icon: Heart },
  { id: 'cafe', name: 'Cafe', icon: Coffee },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
  { id: 'environmental', name: 'Environmental', icon: TreePalm },
  { id: 'international', name: 'International', icon: Globe },
  { id: 'art', name: 'Art & Design', icon: Brush },
  { id: 'fashion', name: 'Fashion', icon: ShoppingBag },
];

export const LogoGenie = () => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [slogan, setSlogan] = useState('');
  const { generateLogo, isGenerating, error, suggestions, imageUrl } = useLogoGeneration();

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateLogo = async () => {
    if (!selectedIndustry || !brandDescription || !companyName) {
      console.error('Please fill in all required fields');
      return;
    }

    await generateLogo({
      industry: selectedIndustry,
      description: brandDescription,
      companyName,
      slogan
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Logo Genie</h1>
          <p className="text-lg text-gray-600">Transform your vision into a stunning logo</p>
        </header>

        <div className="space-y-8">
          {step === 1 && (
            <section className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Your Industry</h2>
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search industries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredIndustries.map((industry) => (
                    <Card
                      key={industry.id}
                      className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                        selectedIndustry === industry.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedIndustry(industry.id)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <industry.icon className="w-8 h-8 text-primary" />
                        <h3 className="font-medium text-gray-900">{industry.name}</h3>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </section>
          )}

          {step === 2 && (
            <section className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Describe Your Brand</h2>
              <Card className="glass-panel p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Textarea
                      placeholder="Describe your brand's personality, values, and vision..."
                      className="min-h-[120px] resize-none"
                      value={brandDescription}
                      onChange={(e) => setBrandDescription(e.target.value)}
                    />
                    <Button size="icon" variant="outline">
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    AI will analyze your description to suggest the perfect color palette and style
                  </p>
                </div>
              </Card>
            </section>
          )}

          {step === 3 && (
            <section className="animate-fadeIn">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Company Details</h2>
              <Card className="glass-panel p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input
                      placeholder="Enter your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slogan (Optional)</label>
                    <Input
                      placeholder="Enter your slogan"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </section>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button className="ml-auto" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button 
                className="ml-auto" 
                onClick={handleGenerateLogo}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Logo'}
              </Button>
            )}
          </div>

          {error && (
            <p className="text-red-500 mt-4">Error: {error}</p>
          )}

          {(suggestions || imageUrl) && (
            <div className="mt-8 space-y-8">
              {imageUrl && (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Generated Logo</h3>
                  <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt="Generated logo"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <Button className="mt-4" asChild>
                    <a href={imageUrl} download="logo.png" target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download Logo
                    </a>
                  </Button>
                </div>
              )}
              
              {suggestions && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Design Suggestions</h3>
                  <Card className="prose prose-sm max-w-none p-6">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: suggestions.replace(/\n/g, '<br />') 
                      }} 
                    />
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
