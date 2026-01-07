import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RailwayIntegrationGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const javascriptCode = `// Install the Africoin SDK
npm install @africoin/sdk

// Initialize the SDK
import Africoin from '@africoin/sdk';

const africoin = new Africoin({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'sandbox'
});

// Register a railway station
const station = await africoin.railway.stations.create({
  station_name: 'Nairobi Central Station',
  station_code: 'NBO-CENTRAL',
  city: 'Nairobi',
  country: 'Kenya',
  latitude: -1.2864,
  longitude: 36.8172,
  facilities: ['wifi', 'parking', 'restaurant', 'waiting_room']
});

console.log('Station ID:', station.id);
console.log('Station Code:', station.station_code);

// Create a route
const route = await africoin.railway.routes.create({
  route_name: 'Nairobi to Mombasa Express',
  origin_station_id: station.id,
  destination_station_id: 'dest-station-id',
  train_number: 'ARN-101',
  departure_time: '08:00:00',
  arrival_time: '14:30:00',
  price_usd: 150.00,
  price_afc: 15000, // Price in AFC tokens
  available_seats: 200,
  train_class: 'economy'
});

// Handle booking webhook
app.post('/webhook/booking', async (req, res) => {
  const booking = req.body;
  
  // Verify webhook signature
  const isValid = africoin.webhooks.verify(
    req.body,
    req.headers['x-africoin-signature']
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process booking
  console.log('New booking:', booking.id);
  console.log('Route:', booking.route_name);
  console.log('Passenger:', booking.passenger_name);
  console.log('Seats:', booking.seats);
  
  // Update your system
  await updateBookingInYourSystem(booking);
  
  res.status(200).send('OK');
});

// Create a payment for ticket booking
const payment = await africoin.payments.create({
  amount: 150.00,
  currency: 'USD',
  customerEmail: 'customer@example.com',
  description: 'Train Ticket - Nairobi to Mombasa',
  metadata: {
    route_id: route.id,
    train_number: 'ARN-101',
    seats: 2
  }
});

console.log('Payment ID:', payment.id);
console.log('Payment URL:', payment.checkoutUrl);`;

  const pythonCode = `# Install the Africoin SDK
pip install africoin-sdk

# Initialize the SDK
from africoin import Africoin

africoin = Africoin(
    api_key='YOUR_API_KEY',
    environment='production'  # or 'sandbox'
)

# Register a railway station
station = africoin.railway.stations.create(
    station_name='Nairobi Central Station',
    station_code='NBO-CENTRAL',
    city='Nairobi',
    country='Kenya',
    latitude=-1.2864,
    longitude=36.8172,
    facilities=['wifi', 'parking', 'restaurant', 'waiting_room']
)

print(f'Station ID: {station.id}')
print(f'Station Code: {station.station_code}')

# Create a route
route = africoin.railway.routes.create(
    route_name='Nairobi to Mombasa Express',
    origin_station_id=station.id,
    destination_station_id='dest-station-id',
    train_number='ARN-101',
    departure_time='08:00:00',
    arrival_time='14:30:00',
    price_usd=150.00,
    price_afc=15000,  # Price in AFC tokens
    available_seats=200,
    train_class='economy'
)

# Handle booking webhook
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook/booking', methods=['POST'])
def handle_booking():
    booking = request.json
    
    # Verify webhook signature
    signature = request.headers.get('X-Africoin-Signature')
    is_valid = africoin.webhooks.verify(request.data, signature)
    
    if not is_valid:
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process booking
    print(f'New booking: {booking["id"]}')
    print(f'Route: {booking["route_name"]}')
    print(f'Passenger: {booking["passenger_name"]}')
    print(f'Seats: {booking["seats"]}')
    
    # Update your system
    update_booking_in_your_system(booking)
    
    return jsonify({'status': 'ok'}), 200

# Create a payment for ticket booking
payment = africoin.payments.create(
    amount=150.00,
    currency='USD',
    customer_email='customer@example.com',
    description='Train Ticket - Nairobi to Mombasa',
    metadata={
        'route_id': route.id,
        'train_number': 'ARN-101',
        'seats': 2
    }
)

print(f'Payment ID: {payment.id}')
print(f'Payment URL: {payment.checkout_url}')`;

  const phpCode = `<?php
// Install the Africoin SDK
// composer require africoin/sdk

require_once 'vendor/autoload.php';

use Africoin\\Africoin;

// Initialize the SDK
$africoin = new Africoin([
    'apiKey' => 'YOUR_API_KEY',
    'environment' => 'production' // or 'sandbox'
]);

// Register a railway station
$station = $africoin->railway->stations->create([
    'station_name' => 'Nairobi Central Station',
    'station_code' => 'NBO-CENTRAL',
    'city' => 'Nairobi',
    'country' => 'Kenya',
    'latitude' => -1.2864,
    'longitude' => 36.8172,
    'facilities' => ['wifi', 'parking', 'restaurant', 'waiting_room']
]);

echo 'Station ID: ' . $station->id . "\\n";
echo 'Station Code: ' . $station->station_code . "\\n";

// Create a route
$route = $africoin->railway->routes->create([
    'route_name' => 'Nairobi to Mombasa Express',
    'origin_station_id' => $station->id,
    'destination_station_id' => 'dest-station-id',
    'train_number' => 'ARN-101',
    'departure_time' => '08:00:00',
    'arrival_time' => '14:30:00',
    'price_usd' => 150.00,
    'price_afc' => 15000, // Price in AFC tokens
    'available_seats' => 200,
    'train_class' => 'economy'
]);

// Handle booking webhook
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_AFRICOIN_SIGNATURE'];

// Verify webhook signature
$isValid = $africoin->webhooks->verify($payload, $signature);

if (!$isValid) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$booking = json_decode($payload, true);

// Process booking
echo 'New booking: ' . $booking['id'] . "\\n";
echo 'Route: ' . $booking['route_name'] . "\\n";
echo 'Passenger: ' . $booking['passenger_name'] . "\\n";
echo 'Seats: ' . $booking['seats'] . "\\n";

// Update your system
updateBookingInYourSystem($booking);

http_response_code(200);
echo json_encode(['status' => 'ok']);

// Create a payment for ticket booking
$payment = $africoin->payments->create([
    'amount' => 150.00,
    'currency' => 'USD',
    'customerEmail' => 'customer@example.com',
    'description' => 'Train Ticket - Nairobi to Mombasa',
    'metadata' => [
        'route_id' => $route->id,
        'train_number' => 'ARN-101',
        'seats' => 2
    ]
]);

echo 'Payment ID: ' . $payment->id . "\\n";
echo 'Payment URL: ' . $payment->checkoutUrl . "\\n";
?>`;

  const curlCode = `# Register a railway station
curl -X POST https://api.africa-railways.com/v1/railway-station-register \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "station_name": "Nairobi Central Station",
    "station_code": "NBO-CENTRAL",
    "city": "Nairobi",
    "country": "Kenya",
    "latitude": -1.2864,
    "longitude": 36.8172,
    "facilities": ["wifi", "parking", "restaurant", "waiting_room"]
  }'

# Create a route
curl -X POST https://api.africa-railways.com/v1/railway-routes \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "route_name": "Nairobi to Mombasa Express",
    "origin_station_id": "station-id-1",
    "destination_station_id": "station-id-2",
    "train_number": "ARN-101",
    "departure_time": "08:00:00",
    "arrival_time": "14:30:00",
    "price_usd": 150.00,
    "price_afc": 15000,
    "available_seats": 200,
    "train_class": "economy"
  }'

# Get all your stations
curl -X GET https://api.africa-railways.com/v1/railway-stations \\
  -H "X-API-Key: YOUR_API_KEY"

# Get all your routes
curl -X GET https://api.africa-railways.com/v1/railway-routes \\
  -H "X-API-Key: YOUR_API_KEY"

# Update route availability
curl -X PATCH https://api.africa-railways.com/v1/railway-routes/{route_id} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "available_seats": 150,
    "status": "active"
  }'`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            Learn how to integrate your railway services with Africa Railways platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript" className="space-y-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyCode(javascriptCode, 'javascript')}
                >
                  {copiedCode === 'javascript' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{javascriptCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyCode(pythonCode, 'python')}
                >
                  {copiedCode === 'python' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="php" className="space-y-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyCode(phpCode, 'php')}
                >
                  {copiedCode === 'php' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{phpCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="curl" className="space-y-4">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => copyCode(curlCode, 'curl')}
                >
                  {copiedCode === 'curl' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{curlCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Available Events</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">booking.created</span>
                <span className="text-gray-600">New booking created for your route</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">booking.confirmed</span>
                <span className="text-gray-600">Booking payment confirmed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">booking.cancelled</span>
                <span className="text-gray-600">Booking cancelled by customer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">payment.succeeded</span>
                <span className="text-gray-600">Payment successfully processed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">payment.failed</span>
                <span className="text-gray-600">Payment failed</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Webhook Payload Example</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "event": "booking.created",
  "timestamp": "2026-01-07T23:00:00Z",
  "data": {
    "id": "booking_123456",
    "route_id": "route_789",
    "route_name": "Nairobi to Mombasa Express",
    "train_number": "ARN-101",
    "passenger_name": "John Doe",
    "passenger_email": "john@example.com",
    "passenger_phone": "+254712345678",
    "seats": 2,
    "seat_numbers": ["A12", "A13"],
    "departure_date": "2026-01-15",
    "departure_time": "08:00:00",
    "total_amount": 300.00,
    "currency": "USD",
    "payment_status": "confirmed",
    "booking_reference": "ARN-20260115-001"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing</CardTitle>
          <CardDescription>
            Use sandbox environment for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Sandbox API Key</h4>
            <p className="text-sm text-gray-600 mb-2">
              Use your sandbox API key for testing. Sandbox transactions won't affect real data.
            </p>
            <code className="bg-gray-100 px-3 py-1 rounded text-sm">
              ark_sandbox_xxxxxxxxxxxxx
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Test Cards</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono">4242 4242 4242 4242</span>
                <span className="text-gray-600">Success</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono">4000 0000 0000 0002</span>
                <span className="text-gray-600">Declined</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono">4000 0000 0000 9995</span>
                <span className="text-gray-600">Insufficient funds</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
