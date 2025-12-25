/**
 * Africa Railways API Client
 * 
 * Integrates Africoin Wallet with Africa Railways backend
 * Handles booking, payments, and real-time tracking
 */

const API_BASE_URL = import.meta.env.VITE_AFRICA_RAILWAYS_API_URL || 'https://api.africa-railways.com';
const API_KEY = import.meta.env.AFRICA_RAILWAYS_API_KEY || '';

interface RouteSearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface BookingData {
  routeId: string;
  from: string;
  to: string;
  departureDate: string;
  passengers: {
    adults: number;
    children: number;
  };
  seats: string[];
  totalPrice: number;
}

interface PaymentData {
  bookingId: string;
  ethTxHash: string;
  amount: string;
  token: 'AFC' | 'ETH' | 'USDC';
}

interface TrainTelemetry {
  trainId: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: 'on_time' | 'delayed' | 'stopped';
  nextStation: string;
  estimatedArrival: string;
}

class AfricaRailwaysAPI {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string = API_BASE_URL, apiKey: string = API_KEY) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Africa Railways API Error:', error);
      throw error;
    }
  }

  /**
   * Search for available routes
   */
  async searchRoutes(params: RouteSearchParams) {
    return this.request('/api/v1/routes/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingData) {
    return this.request('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string) {
    return this.request(`/api/v1/bookings/${bookingId}`, {
      method: 'GET',
    });
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string) {
    return this.request(`/api/v1/users/${userId}/bookings`, {
      method: 'GET',
    });
  }

  /**
   * Process payment for booking
   */
  async processPayment(paymentData: PaymentData) {
    return this.request('/api/v1/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string) {
    return this.request(`/api/v1/payments/${paymentId}/verify`, {
      method: 'GET',
    });
  }

  /**
   * Get real-time train telemetry
   */
  async getTrainTelemetry(trainId: string): Promise<TrainTelemetry> {
    return this.request(`/api/v1/trains/${trainId}/telemetry`, {
      method: 'GET',
    });
  }

  /**
   * Subscribe to train tracking updates via WebSocket
   */
  subscribeToTrainTracking(
    trainId: string,
    onUpdate: (telemetry: TrainTelemetry) => void,
    onError?: (error: Error) => void
  ): () => void {
    const wsURL = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsURL}/telemetry`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        trainId: trainId,
        apiKey: this.apiKey,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const telemetry = JSON.parse(event.data);
        onUpdate(telemetry);
      } catch (error) {
        console.error('Failed to parse telemetry data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(new Error('WebSocket connection failed'));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Return cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }

  /**
   * Get sentinel network reports
   */
  async getSentinelReports(filters?: {
    trainId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams(filters as any).toString();
    return this.request(`/api/v1/sentinel/reports?${queryParams}`, {
      method: 'GET',
    });
  }

  /**
   * Get route details
   */
  async getRoute(routeId: string) {
    return this.request(`/api/v1/routes/${routeId}`, {
      method: 'GET',
    });
  }

  /**
   * Get available seats for a route
   */
  async getAvailableSeats(routeId: string, date: string) {
    return this.request(`/api/v1/routes/${routeId}/seats?date=${date}`, {
      method: 'GET',
    });
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string) {
    return this.request(`/api/v1/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Request refund
   */
  async requestRefund(bookingId: string) {
    return this.request(`/api/v1/bookings/${bookingId}/refund`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const africaRailwaysAPI = new AfricaRailwaysAPI();

// Export class for custom instances
export { AfricaRailwaysAPI };

// Export types
export type {
  RouteSearchParams,
  BookingData,
  PaymentData,
  TrainTelemetry,
};
