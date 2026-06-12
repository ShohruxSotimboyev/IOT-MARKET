import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import { Navigation, MapPin, ExternalLink } from 'lucide-react'
import { STORE } from '../../data/store'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Navbat tugmalari konfiguratsiyasi
const NAV_APPS = [
  {
    id: 'google',
    label: 'Google Maps',
    icon: '🗺️',
    color: 'from-blue-500/30 to-green-500/20 border-blue-500/30 hover:border-blue-400/60',
    getUrl: (lat, lng, name) =>
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`,
  },
  {
    id: 'yandex',
    label: 'Yandex Maps',
    icon: '🧭',
    color: 'from-red-500/30 to-orange-500/20 border-red-500/30 hover:border-red-400/60',
    getUrl: (lat, lng) =>
      `https://yandex.com/maps/?rtext=~${lat},${lng}&rtt=auto`,
  },
  {
    id: '2gis',
    label: '2GIS',
    icon: '📍',
    color: 'from-emerald-500/30 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/60',
    getUrl: (lat, lng) =>
      `https://2gis.uz/urganch/geo/${lng},${lat}`,
  },
]

export default function StoreMap({ className = '', height = 420 }) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  const [lat, lng] = STORE.coords

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: STORE.coords,
      zoom: STORE.zoom,
      scrollWheelZoom: false,
    })

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Esri, Maxar, Earthstar Geographics', maxZoom: 19 }
    ).addTo(map)

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19, opacity: 0.85 }
    ).addTo(map)

    // Custom icon
    const customIcon = L.divIcon({
      html: `<div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#0A74DA,#00AFA3);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 15px rgba(0,175,163,0.5);
      ">
        <div style="
          width:14px;height:14px;
          background:white;
          border-radius:50%;
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%) rotate(45deg);
        "></div>
      </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    })

    const marker = L.marker(STORE.coords, { icon: customIcon }).addTo(map)
    marker.bindPopup(`
      <div style="font-family:sans-serif;min-width:180px;">
        <strong style="color:#0A74DA;font-size:15px;">${STORE.name}</strong>
        <p style="margin:4px 0;font-size:12px;color:#555;">${STORE.address}</p>
        <a href="tel:${STORE.phone.replace(/\s/g, '')}" style="color:#00AFA3;font-weight:bold;font-size:13px;">${STORE.phone}</a>
      </div>
    `)
    marker.openPopup()

    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Xarita */}
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl z-0"
        style={{ height, minHeight: height }}
        aria-label="Do'kon xaritasi — Urganch"
      />

      {/* Yo'l ko'rsatish kartasi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden"
      >
        {/* Sarlavha */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Navigation size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Do'konga marshrut</h3>
            <p className="text-white/50 text-xs">Qulay xarita ilovasini tanlang</p>
          </div>
        </div>

        {/* Do'kon manzili — kichkina ko'rinish */}
        <div className="px-6 py-4 flex items-start gap-3 border-b border-white/5">
          <MapPin size={18} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-white/90 text-sm font-medium">{STORE.address}</p>
            <p className="text-white/40 text-xs mt-1">
              Koordinatalar: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Navigatsiya tugmalari */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {NAV_APPS.map((app) => (
            <motion.a
              key={app.id}
              href={app.getUrl(lat, lng, STORE.name)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-gradient-to-br ${app.color} transition-all duration-300 group`}
            >
              <span className="text-2xl leading-none">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{app.label}</p>
                <p className="text-white/40 text-[11px]">Yo'l ko'rsat</p>
              </div>
              <ExternalLink size={14} className="text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
            </motion.a>
          ))}
        </div>

        {/* Qo'shimcha ma'lumot */}
        <div className="px-6 pb-5">
          <p className="text-white/30 text-[11px] text-center">
            Tanlagan ilovangiz orqali real vaqtda yo'l boshlovchi ishga tushadi
          </p>
        </div>
      </motion.div>
    </div>
  )
}
