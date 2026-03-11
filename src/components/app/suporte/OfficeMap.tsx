import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

export interface Office {
  cidade: string;
  uf: string;
  endereco: string;
  cep: string;
  lat: number;
  lng: number;
}

export const escritorios: Office[] = [
  { cidade: "Altamira", uf: "PA", endereco: "Av. Popular, 1816 Sudam II, Altamira – PA 68374-295", cep: "68374-295", lat: -3.2132, lng: -52.2064 },
  { cidade: "Cascavel", uf: "PR", endereco: "R. São Luís, 2137 Recanto Tropical, Cascavel – PR 85807-110", cep: "85807-110", lat: -24.9578, lng: -53.4596 },
  { cidade: "Caxias do Sul", uf: "RS", endereco: "Av. Itália, 288 – Sala 65 São Pelegrino, Caxias do Sul – RS 95010-040", cep: "95010-040", lat: -29.1681, lng: -51.1794 },
  { cidade: "Ji-Paraná", uf: "RO", endereco: "Av. Aracajú, 2368 Sala 07 Nova Brasília, Ji-Paraná – RO 76913-106", cep: "76913-106", lat: -10.8853, lng: -61.9517 },
  { cidade: "São Paulo", uf: "SP", endereco: "Rua Vergueiro, 1855 4º andar, Sala 41, Vila Mariana, São Paulo – SP 04101-000", cep: "04101-000", lat: -23.5728, lng: -46.6396 },
  { cidade: "João Pessoa", uf: "PB", endereco: "R. Cândida Maria da Silva, 340 João Paulo II, João Pessoa – PB 58076-242", cep: "58076-242", lat: -7.1195, lng: -34.8450 },
  { cidade: "Salvador", uf: "BA", endereco: "R. Cel. Almerindo Rehem, 126 Sala 505/506 Caminho das Árvores, Salvador – BA 41820-768", cep: "41820-768", lat: -12.9877, lng: -38.4694 },
  { cidade: "Londrina", uf: "PR", endereco: "Av. Arcindo Sardo, 460 Sala 01 – Shopping Coliseu, Londrina – PR", cep: "", lat: -23.3045, lng: -51.1696 },
  { cidade: "Uberlândia", uf: "MG", endereco: "Av. Dom Pedro II, 841 Alto Umuarama, Uberlândia – MG 38405-280", cep: "38405-280", lat: -18.9186, lng: -48.2772 },
  { cidade: "Brasília", uf: "DF", endereco: "C 07 Lote 07 Sn Lt 12, Sl 101, Taguatinga Centro, Taguatinga – DF", cep: "", lat: -15.8350, lng: -48.0538 },
];

// Custom pin icon using SVG
function createPinIcon(isActive: boolean) {
  const color = isActive ? "#1e40af" : "#3b82f6";
  const size = isActive ? 36 : 28;
  return L.divIcon({
    className: "custom-pin",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

interface OfficeMapProps {
  selectedOffice: Office | null;
  onSelectOffice: (office: Office) => void;
}

export default function OfficeMap({ selectedOffice, onSelectOffice }: OfficeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-14.5, -50],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    escritorios.forEach((office) => {
      const marker = L.marker([office.lat, office.lng], {
        icon: createPinIcon(false),
      }).addTo(map);

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`;

      marker.bindPopup(
        `<div style="font-family: system-ui, sans-serif; min-width: 180px; padding: 4px 0;">
          <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px; color: #1e3a5f;">${office.cidade} – ${office.uf}</p>
          <p style="font-size: 11px; color: #555; margin: 0 0 10px; line-height: 1.4;">${office.endereco}</p>
          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; background: #1e40af; color: white; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
            ▸ Como chegar
          </a>
        </div>`,
        { closeButton: true, maxWidth: 240 }
      );

      marker.on("click", () => onSelectOffice(office));
      markersRef.current.set(office.cidade, marker);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // React to selectedOffice changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Reset all icons
    markersRef.current.forEach((marker, cidade) => {
      const isActive = selectedOffice?.cidade === cidade;
      marker.setIcon(createPinIcon(isActive));
    });

    if (selectedOffice) {
      map.flyTo([selectedOffice.lat, selectedOffice.lng], 13, { duration: 1.2 });
      const marker = markersRef.current.get(selectedOffice.cidade);
      if (marker) {
        setTimeout(() => marker.openPopup(), 600);
      }
    }
  }, [selectedOffice]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-lg border border-border overflow-hidden"
      style={{ height: 360 }}
    />
  );
}
