import { PRODUCTS } from '../data'

const SYNONYMS = {
  wifi: ['wi-fi', 'wireless', 'esp', 'esp32', 'esp8266', 'nodemcu'],
  bluetooth: ['ble', 'bt'],
  arduino: ['uno', 'mega', 'nano', 'avr', 'mikrokontroller'],
  raspberry: ['rpi', 'pi', 'raspi'],
  sensor: ['sensorlar', 'dht', 'pir', 'mq', 'bme', 'ultrasonic'],
  display: ['displey', 'oled', 'lcd', 'tft', 'ekran', 'screen'],
  motor: ['servo', 'stepper', 'dc', 'motorlar'],
  smart: ['aqlli', 'home', 'uy', 'zigbee', 'automation'],
  tool: ['asbob', 'lehim', 'multimeter', 'multimetr'],
  iot: ['internet', 'things', 'internet of things'],
  camera: ['kamera', 'cam', 'esp32-cam'],
  relay: ['rele', 'switch'],
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
}

function expandTokens(tokens) {
  const out = new Set(tokens)
  for (const t of tokens) {
    out.add(t)
    for (const [key, aliases] of Object.entries(SYNONYMS)) {
      if (t.includes(key) || aliases.some((a) => t.includes(a))) {
        out.add(key)
        aliases.forEach((a) => out.add(a))
      }
    }
  }
  return [...out]
}

function productHaystack(p) {
  const tags = Array.isArray(p.tags) ? p.tags.join(' ') : ''
  return normalize(`${p.name} ${p.cat} ${p.desc || ''} ${tags}`)
}

function scoreProduct(p, tokens) {
  const hay = productHaystack(p)
  const name = normalize(p.name)
  const cat = normalize(p.cat)
  let score = 0

  const fullQuery = tokens.join(' ')
  if (fullQuery && hay.includes(fullQuery)) score += 80
  if (name.includes(fullQuery)) score += 40

  for (const token of tokens) {
    if (!token) continue
    if (name === token) score += 100
    else if (name.startsWith(token)) score += 60
    else if (name.includes(token)) score += 45
    else if (cat.includes(token)) score += 30
    else if (hay.includes(token)) score += 18
    else {
      let partial = false
      for (const word of hay.split(/\s+/)) {
        if (word.startsWith(token) || token.startsWith(word.slice(0, Math.max(3, token.length)))) {
          partial = true
          break
        }
      }
      if (partial) score += 8
    }
  }

  if (p.badge === 'HOT' && tokens.some((t) => ['hot', 'qaynoq', 'mashhur'].includes(t))) score += 12
  return score
}

export function searchProducts(query, limit = 8) {
  const q = normalize(query.trim())
  if (!q) return []

  const rawTokens = q.split(/\s+/).filter(Boolean)
  const tokens = expandTokens(rawTokens)

  return PRODUCTS.map((p) => ({ p, score: scoreProduct(p, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p)
}
