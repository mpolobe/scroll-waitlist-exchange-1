import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Eye, EyeOff, Plus, Train, MapPin, Key, CheckCircle, Clock, XCircle } from 'lucide-react';
import RailwayIntegrationGuide from './RailwayIntegrationGuide';

interface RailwayCompany {
  id: string;
  company_name: string;
  country: string;
  contact_email: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  api_key?: string;
  api_secret?: string;
  created_at: string;
}

interface Station {
  id: string;
  station_name: string;
  station_code: string;
  city: string;
  country: string;
  status: string;
}

export default function RailwayApiManagement() {
  const [company, setCompany] = useState<RailwayCompany | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Registration form state
  const [regForm, setRegForm] = useState({
    company_name: '',
    country: '',
    contact_email: '',
    contact_phone: '',
    website: '',
  });

  // Station form state
  const [stationForm, setStationForm] = useState({
    station_name: '',
    station_code: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    address: '',
    facilities: '',
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyData, error } = await supabase
        .from('railway_companies')
        .select('*')
        .eq('contact_email', user.email)
        .single();

      if (companyData) {
        setCompany(companyData);
        loadStations(companyData.id);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async (companyId: string) => {
    const { data, error } = await supabase
      .from('railway_stations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (data) setStations(data);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('railway-api-register', {
        body: regForm
      });

      if (error) throw error;

      toast.success('Registration submitted! You will be notified once approved.');
      loadCompanyData();
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.api_key) return;

    setLoading(true);

    try {
      const facilities = stationForm.facilities.split(',').map(f => f.trim()).filter(Boolean);
      
      const { data, error } = await supabase.functions.invoke('railway-station-register', {
        body: {
          ...stationForm,
          latitude: stationForm.latitude ? parseFloat(stationForm.latitude) : null,
          longitude: stationForm.longitude ? parseFloat(stationForm.longitude) : null,
          facilities
        },
        headers: {
          'X-API-Key': company.api_key
        }
      });

      if (error) throw error;

      toast.success('Station registered successfully!');
      setStationForm({
        station_name: '',
        station_code: '',
        city: '',
        country: '',
        latitude: '',
        longitude: '',
        address: '',
        facilities: '',
      });
      loadStations(company.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register station');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircle },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };

    const { color, icon: Icon } = variants[status] || variants.pending;

    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Registration form for new companies
  if (!company) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="w-6 h-6" />
              Register Your Railway Company
            </CardTitle>
            <CardDescription>
              Get API access to integrate your railway services with Africa Railways
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={regForm.company_name}
                  onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={regForm.country}
                  onChange={(e) => setRegForm({ ...regForm, country: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={regForm.contact_email}
                  onChange={(e) => setRegForm({ ...regForm, contact_email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={regForm.contact_phone}
                  onChange={(e) => setRegForm({ ...regForm, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={regForm.website}
                  onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard for registered companies
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{company.company_name}</h1>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{company.country}</span>
          {getStatusBadge(company.status)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
            </CardHeader>
            <CardContent>
              {company.status === 'approved' ? (
                <div className="space-y-2">
                  <p className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your API access is active
                  </p>
                  <p className="text-sm text-gray-600">
                    You can now integrate your railway services with Africa Railways platform.
                  </p>
                </div>
              ) : company.status === 'pending' ? (
                <div className="space-y-2">
                  <p className="text-yellow-600 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Your registration is pending approval
                  </p>
                  <p className="text-sm text-gray-600">
                    We will notify you via email once your application is reviewed.
                  </p>
                </div>
              ) : (
                <p className="text-red-600">Your API access is {company.status}</p>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stations.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Calls (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          {company.status === 'approved' && company.api_key ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Credentials
                </CardTitle>
                <CardDescription>
                  Use these credentials to authenticate your API requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={company.api_key} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(company.api_key!, 'API Key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {company.api_secret && (
                  <div>
                    <Label>API Secret</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type={showApiSecret ? 'text' : 'password'}
                        value={company.api_secret}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                      >
                        {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(company.api_secret!, 'API Secret')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Keep your API credentials secure. Never share them publicly or commit them to version control.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-600">
                API credentials will be available once your registration is approved.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          {company.status === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Register New Station
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStation} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="station_name">Station Name *</Label>
                      <Input
                        id="station_name"
                        value={stationForm.station_name}
                        onChange={(e) => setStationForm({ ...stationForm, station_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="station_code">Station Code *</Label>
                      <Input
                        id="station_code"
                        value={stationForm.station_code}
                        onChange={(e) => setStationForm({ ...stationForm, station_code: e.target.value.toUpperCase() })}
                        placeholder="e.g., NBO-CENTRAL"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={stationForm.city}
                        onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={stationForm.country}
                        onChange={(e) => setStationForm({ ...stationForm, country: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={stationForm.latitude}
                        onChange={(e) => setStationForm({ ...stationForm, latitude: e.target.value })}
                        placeholder="-1.2864"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={stationForm.longitude}
                        onChange={(e) => setStationForm({ ...stationForm, longitude: e.target.value })}
                        placeholder="36.8172"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={stationForm.address}
                      onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                    <Input
                      id="facilities"
                      value={stationForm.facilities}
                      onChange={(e) => setStationForm({ ...stationForm, facilities: e.target.value })}
                      placeholder="wifi, parking, restaurant, waiting_room"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Station'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Stations ({stations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stations.length > 0 ? (
                <div className="space-y-2">
                  {stations.map((station) => (
                    <div key={station.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{station.station_name}</p>
                        <p className="text-sm text-gray-600">
                          {station.city}, {station.country} • {station.station_code}
                        </p>
                      </div>
                      <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                        {station.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No stations registered yet. Add your first station above.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <RailwayIntegrationGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
