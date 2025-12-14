import { useState } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactUs() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const offices = [
    {
      city: 'Nairobi, Kenya',
      address: 'Westlands Business Park, Waiyaki Way',
      phone: '+254 20 123 4567',
      email: 'nairobi@africoin.com'
    },
    {
      city: 'Lagos, Nigeria',
      address: 'Victoria Island, Ahmadu Bello Way',
      phone: '+234 1 234 5678',
      email: 'lagos@africoin.com'
    },
    {
      city: 'Cape Town, South Africa',
      address: 'Century City, Ratanga Road',
      phone: '+27 21 123 4567',
      email: 'capetown@africoin.com'
    },
    {
      city: 'Lusaka, Zambia',
      address: 'Cairo Road, City Centre',
      phone: '+260 21 123 4567',
      email: 'lusaka@africoin.com'
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <MarketingNav />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>
                
                <div>
                  <Textarea
                    placeholder="Your Message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-gray-600">+254 800 123 456</p>
                    <p className="text-sm text-gray-500">Mon-Fri 8am-6pm EAT</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-600">support@africoin.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8am - 6pm</p>
                    <p className="text-gray-600">Saturday: 9am - 2pm</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Our Offices</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {offices.map((office, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <MapPin className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-3">{office.city}</h3>
                  <p className="text-gray-600 mb-2">{office.address}</p>
                  <p className="text-gray-600 mb-1">
                    <Phone className="w-4 h-4 inline mr-2" />
                    {office.phone}
                  </p>
                  <p className="text-gray-600">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {office.email}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764352995964_8c4dbd28.webp"
              alt="Our office location"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
