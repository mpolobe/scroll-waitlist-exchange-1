// African Capital City Train Stations
// Extracted from Africa Railways capitals.json

export interface CapitalStation {
  id: string;
  name: string;
  code: string;
  country: string;
  type: 'capital';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const capitalStations: CapitalStation[] = [
  { id: 'alg', name: 'Algiers', code: 'ALG', country: 'Algeria', type: 'capital', coordinates: { lat: 36.7538, lng: 3.0588 } },
  { id: 'lad', name: 'Luanda', code: 'LAD', country: 'Angola', type: 'capital', coordinates: { lat: -8.8383, lng: 13.2344 } },
  { id: 'pno', name: 'Porto-Novo', code: 'PNO', country: 'Benin', type: 'capital', coordinates: { lat: 6.4969, lng: 2.6289 } },
  { id: 'gbe', name: 'Gaborone', code: 'GBE', country: 'Botswana', type: 'capital', coordinates: { lat: -24.6282, lng: 25.9231 } },
  { id: 'oua', name: 'Ouagadougou', code: 'OUA', country: 'Burkina Faso', type: 'capital', coordinates: { lat: 12.3714, lng: -1.5197 } },
  { id: 'git', name: 'Gitega', code: 'GIT', country: 'Burundi', type: 'capital', coordinates: { lat: -3.4271, lng: 29.9189 } },
  { id: 'rai', name: 'Praia', code: 'RAI', country: 'Cabo Verde', type: 'capital', coordinates: { lat: 14.9330, lng: -23.5133 } },
  { id: 'yao', name: 'Yaoundé', code: 'YAO', country: 'Cameroon', type: 'capital', coordinates: { lat: 3.8480, lng: 11.5021 } },
  { id: 'bgf', name: 'Bangui', code: 'BGF', country: 'Central African Republic', type: 'capital', coordinates: { lat: 4.3947, lng: 18.5582 } },
  { id: 'ndj', name: "N'Djamena", code: 'NDJ', country: 'Chad', type: 'capital', coordinates: { lat: 12.1348, lng: 15.0557 } },
  { id: 'hah', name: 'Moroni', code: 'HAH', country: 'Comoros', type: 'capital', coordinates: { lat: -11.7172, lng: 43.2473 } },
  { id: 'bzv', name: 'Brazzaville', code: 'BZV', country: 'Congo (Congo-Brazzaville)', type: 'capital', coordinates: { lat: -4.2634, lng: 15.2429 } },
  { id: 'fih', name: 'Kinshasa', code: 'FIH', country: 'Congo (Congo-Kinshasa)', type: 'capital', coordinates: { lat: -4.4419, lng: 15.2663 } },
  { id: 'jib', name: 'Djibouti', code: 'JIB', country: 'Djibouti', type: 'capital', coordinates: { lat: 11.8251, lng: 42.5903 } },
  { id: 'cai', name: 'Cairo', code: 'CAI', country: 'Egypt', type: 'capital', coordinates: { lat: 30.0444, lng: 31.2357 } },
  { id: 'ssg', name: 'Malabo', code: 'SSG', country: 'Equatorial Guinea', type: 'capital', coordinates: { lat: 3.7504, lng: 8.7371 } },
  { id: 'asm', name: 'Asmara', code: 'ASM', country: 'Eritrea', type: 'capital', coordinates: { lat: 15.3229, lng: 38.9251 } },
  { id: 'mts', name: 'Mbabane', code: 'MTS', country: 'Eswatini', type: 'capital', coordinates: { lat: -26.3054, lng: 31.1367 } },
  { id: 'add', name: 'Addis Ababa', code: 'ADD', country: 'Ethiopia', type: 'capital', coordinates: { lat: 9.0320, lng: 38.7469 } },
  { id: 'lbv', name: 'Libreville', code: 'LBV', country: 'Gabon', type: 'capital', coordinates: { lat: 0.4162, lng: 9.4673 } },
  { id: 'bjl', name: 'Banjul', code: 'BJL', country: 'Gambia', type: 'capital', coordinates: { lat: 13.4549, lng: -16.5790 } },
  { id: 'acc', name: 'Accra', code: 'ACC', country: 'Ghana', type: 'capital', coordinates: { lat: 5.6037, lng: -0.1870 } },
  { id: 'cky', name: 'Conakry', code: 'CKY', country: 'Guinea', type: 'capital', coordinates: { lat: 9.6412, lng: -13.5784 } },
  { id: 'oxb', name: 'Bissau', code: 'OXB', country: 'Guinea-Bissau', type: 'capital', coordinates: { lat: 11.8636, lng: -15.5982 } },
  { id: 'ask', name: 'Yamoussoukro', code: 'ASK', country: 'Ivory Coast', type: 'capital', coordinates: { lat: 6.8276, lng: -5.2893 } },
  { id: 'nbo', name: 'Nairobi', code: 'NBO', country: 'Kenya', type: 'capital', coordinates: { lat: -1.2864, lng: 36.8172 } },
  { id: 'msu', name: 'Maseru', code: 'MSU', country: 'Lesotho', type: 'capital', coordinates: { lat: -29.3167, lng: 27.4833 } },
  { id: 'rob', name: 'Monrovia', code: 'ROB', country: 'Liberia', type: 'capital', coordinates: { lat: 6.3156, lng: -10.8074 } },
  { id: 'tip', name: 'Tripoli', code: 'TIP', country: 'Libya', type: 'capital', coordinates: { lat: 32.8872, lng: 13.1913 } },
  { id: 'tnr', name: 'Antananarivo', code: 'TNR', country: 'Madagascar', type: 'capital', coordinates: { lat: -18.8792, lng: 47.5079 } },
  { id: 'llw', name: 'Lilongwe', code: 'LLW', country: 'Malawi', type: 'capital', coordinates: { lat: -13.9626, lng: 33.7741 } },
  { id: 'bko', name: 'Bamako', code: 'BKO', country: 'Mali', type: 'capital', coordinates: { lat: 12.6392, lng: -8.0029 } },
  { id: 'nkc', name: 'Nouakchott', code: 'NKC', country: 'Mauritania', type: 'capital', coordinates: { lat: 18.0735, lng: -15.9582 } },
  { id: 'mru', name: 'Port Louis', code: 'MRU', country: 'Mauritius', type: 'capital', coordinates: { lat: -20.1609, lng: 57.5012 } },
  { id: 'rba', name: 'Rabat', code: 'RBA', country: 'Morocco', type: 'capital', coordinates: { lat: 34.0209, lng: -6.8416 } },
  { id: 'mpm', name: 'Maputo', code: 'MPM', country: 'Mozambique', type: 'capital', coordinates: { lat: -25.9655, lng: 32.5832 } },
  { id: 'wdh', name: 'Windhoek', code: 'WDH', country: 'Namibia', type: 'capital', coordinates: { lat: -22.5597, lng: 17.0832 } },
  { id: 'nim', name: 'Niamey', code: 'NIM', country: 'Niger', type: 'capital', coordinates: { lat: 13.5127, lng: 2.1098 } },
  { id: 'abv', name: 'Abuja', code: 'ABV', country: 'Nigeria', type: 'capital', coordinates: { lat: 9.0765, lng: 7.3986 } },
  { id: 'kgl', name: 'Kigali', code: 'KGL', country: 'Rwanda', type: 'capital', coordinates: { lat: -1.9706, lng: 30.1044 } },
  { id: 'tms', name: 'São Tomé', code: 'TMS', country: 'Sao Tome and Principe', type: 'capital', coordinates: { lat: 0.3365, lng: 6.7273 } },
  { id: 'dkr', name: 'Dakar', code: 'DKR', country: 'Senegal', type: 'capital', coordinates: { lat: 14.7167, lng: -17.4677 } },
  { id: 'sez', name: 'Victoria', code: 'SEZ', country: 'Seychelles', type: 'capital', coordinates: { lat: -4.6191, lng: 55.4513 } },
  { id: 'fna', name: 'Freetown', code: 'FNA', country: 'Sierra Leone', type: 'capital', coordinates: { lat: 8.4657, lng: -13.2317 } },
  { id: 'mgq', name: 'Mogadishu', code: 'MGQ', country: 'Somalia', type: 'capital', coordinates: { lat: 2.0469, lng: 45.3182 } },
  { id: 'pry', name: 'Pretoria', code: 'PRY', country: 'South Africa', type: 'capital', coordinates: { lat: -25.7479, lng: 28.2293 } },
  { id: 'jub', name: 'Juba', code: 'JUB', country: 'South Sudan', type: 'capital', coordinates: { lat: 4.8517, lng: 31.5825 } },
  { id: 'krt', name: 'Khartoum', code: 'KRT', country: 'Sudan', type: 'capital', coordinates: { lat: 15.5007, lng: 32.5599 } },
  { id: 'dar', name: 'Dar es Salaam', code: 'DAR', country: 'Tanzania', type: 'capital', coordinates: { lat: -6.7924, lng: 39.2083 } },
  { id: 'lfw', name: 'Lomé', code: 'LFW', country: 'Togo', type: 'capital', coordinates: { lat: 6.1256, lng: 1.2315 } },
  { id: 'tun', name: 'Tunis', code: 'TUN', country: 'Tunisia', type: 'capital', coordinates: { lat: 36.8065, lng: 10.1815 } },
  { id: 'ebb', name: 'Kampala', code: 'EBB', country: 'Uganda', type: 'capital', coordinates: { lat: 0.3476, lng: 32.5825 } },
  { id: 'lun', name: 'Lusaka', code: 'LUN', country: 'Zambia', type: 'capital', coordinates: { lat: -15.3875, lng: 28.3228 } },
  { id: 'hre', name: 'Harare', code: 'HRE', country: 'Zimbabwe', type: 'capital', coordinates: { lat: -17.8252, lng: 31.0335 } },
];

// Helper to get station by code
export const getStationByCode = (code: string): CapitalStation | undefined => {
  return capitalStations.find(s => s.code.toLowerCase() === code.toLowerCase());
};

// Helper to get station by name
export const getStationByName = (name: string): CapitalStation | undefined => {
  return capitalStations.find(s => s.name.toLowerCase() === name.toLowerCase());
};

// Get all stations for a specific country
export const getStationsByCountry = (country: string): CapitalStation[] => {
  return capitalStations.filter(s => s.country.toLowerCase() === country.toLowerCase());
};

// Format station for display
export const formatStation = (station: CapitalStation): string => {
  return `${station.name}, ${station.country} (${station.code})`;
};
