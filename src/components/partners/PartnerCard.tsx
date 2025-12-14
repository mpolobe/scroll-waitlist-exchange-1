import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface PartnerCardProps {
  name: string;
  logo: string;
  description: string;
  industry: string;
  region: string;
  featured?: boolean;
}

export default function PartnerCard({ name, logo, description, industry, region, featured }: PartnerCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? 'border-orange-500 border-2' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <img src={logo} alt={name} className="h-16 w-16 object-contain" />
          {featured && <Badge className="bg-orange-500">Featured</Badge>}
        </div>
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">{industry}</Badge>
          <Badge variant="outline">{region}</Badge>
        </div>
        <Button variant="outline" className="w-full">
          Learn More <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
