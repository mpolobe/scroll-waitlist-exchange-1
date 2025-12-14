import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerCard from "@/components/partners/PartnerCard";
import TestimonialCard from "@/components/partners/TestimonialCard";
import MarketingNav from "@/components/MarketingNav";
import { Building2, Globe, TrendingUp } from "lucide-react";

const partners = [
  {
    name: "Africa Railways Network",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290969003_2b560fc1.webp",
    description: "Leading railway operator across 15 African countries, processing over 2M tickets monthly through Africoin integration.",
    industry: "Transportation",
    region: "Pan-Africa",
    featured: true
  },
  {
    name: "MobiPay Africa",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290969899_95fdffb8.webp",
    description: "Mobile money provider serving 50M+ users across East Africa with seamless Africoin wallet integration.",
    industry: "Mobile Money",
    region: "East Africa",
    featured: false
  },
  {
    name: "Continental Bank Group",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290970775_f92444b6.webp",
    description: "Premier banking institution offering Africoin services at 500+ branches across West Africa.",
    industry: "Banking",
    region: "West Africa",
    featured: false
  },
  {
    name: "PayTech Solutions",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290971658_262acd3b.webp",
    description: "Innovative fintech platform enabling instant cross-border payments using Africoin technology.",
    industry: "Fintech",
    region: "Southern Africa",
    featured: false
  },
  {
    name: "AfriMart Online",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290972506_4444bfda.webp",
    description: "Largest e-commerce marketplace in Africa, accepting Africoin for millions of transactions daily.",
    industry: "E-commerce",
    region: "Pan-Africa",
    featured: false
  },
  {
    name: "TeleConnect Africa",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290973333_3ddea630.webp",
    description: "Major telecommunications provider offering airtime and data purchases via Africoin.",
    industry: "Telecom",
    region: "Central Africa",
    featured: false
  },
  {
    name: "SwiftLogistics",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290981339_8995ce36.webp",
    description: "Leading delivery service using Africoin for COD payments and driver settlements.",
    industry: "Logistics",
    region: "East Africa",
    featured: false
  },
  {
    name: "National Revenue Authority",
    logo: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290982285_40493e1b.webp",
    description: "Government agency accepting Africoin for tax payments and public service fees.",
    industry: "Government",
    region: "West Africa",
    featured: false
  }
];

const testimonials = [
  {
    quote: "Integrating Africoin reduced our payment processing time from 3 days to instant. Our customers love the convenience and our revenue has increased by 40%.",
    author: "Amara Okonkwo",
    position: "CTO",
    company: "Africa Railways Network",
    image: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290983686_3f125ada.webp"
  },
  {
    quote: "The API integration was seamless and the support team was exceptional. We went live in just 2 weeks and haven't looked back since.",
    author: "Kwame Mensah",
    position: "Head of Digital Payments",
    company: "Continental Bank Group",
    image: "https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290984620_9a46727a.webp"
  }
];

export default function Partners() {
  const [filter, setFilter] = useState("all");

  const filteredPartners = filter === "all" 
    ? partners 
    : partners.filter(p => p.industry.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <MarketingNav />
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden mt-16">

        <img 
          src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290968104_62c8d110.webp"
          alt="Partners"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-orange-900/90" />
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl font-bold mb-6">Our Strategic Partners</h1>
          <p className="text-xl mb-8">Powering Africa's digital economy together with leading organizations across the continent</p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            Become a Partner
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-blue-900 mb-2">200+</h3>
              <p className="text-gray-600">Active Partners</p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-blue-900 mb-2">45</h3>
              <p className="text-gray-600">Countries Covered</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-blue-900 mb-2">$2B+</h3>
              <p className="text-gray-600">Transaction Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Partners</h2>
          
          <Tabs defaultValue="all" className="mb-8" onValueChange={setFilter}>
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="transportation">Transport</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="fintech">Fintech</TabsTrigger>
              <TabsTrigger value="e-commerce">E-commerce</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPartners.map((partner, index) => (
              <PartnerCard key={index} {...partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Partners Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-orange-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner with Africoin?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join hundreds of organizations transforming payments across Africa</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
