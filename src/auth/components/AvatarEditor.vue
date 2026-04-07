<template>
  <div class="avatar-editor">
    <div class="preview-area">
      <img :src="previewSvg" alt="Avatar preview" class="avatar-preview-lg" />
    </div>

    <div class="category-grid">
      <div v-for="cat in categories" :key="cat.label" class="category-card">
        <span class="card-label">{{ cat.label }}</span>

        <!-- Type carousel -->
        <div v-if="cat.typeList" class="carousel">
          <button type="button" class="carousel-btn" @click="cycle(cat.typeKey, cat.typeList, -1)">‹</button>
          <span class="carousel-value">{{ typeLabel(cat) }}</span>
          <button type="button" class="carousel-btn" @click="cycle(cat.typeKey, cat.typeList, 1)">›</button>
        </div>

        <!-- Graphic sub-carousel (clothing only) -->
        <div v-if="cat.typeKey === 'clothing' && options.clothing === 'graphicShirt'" class="carousel">
          <button type="button" class="carousel-btn" @click="cycle('clothingGraphic', CLOTHING_GRAPHIC_OPTIONS, -1)">‹</button>
          <span class="carousel-value carousel-value-sm">{{ formatLabel(options.clothingGraphic) }}</span>
          <button type="button" class="carousel-btn" @click="cycle('clothingGraphic', CLOTHING_GRAPHIC_OPTIONS, 1)">›</button>
        </div>

        <!-- Color swatches -->
        <div v-if="cat.colorList && showColors(cat)" class="swatch-row">
          <button
            v-for="color in cat.colorList"
            :key="color"
            type="button"
            class="swatch"
            :class="{ active: isActiveColor(cat.colorKey, color) }"
            :style="swatchBg(color)"
            @click="setOption(cat.colorKey, color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { createAvatar, type Options } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars'
import {
  type AvatarOptions,
  parseAvatarString,
  serializeAvatarOptions,
} from '../../shared/utils/avatarUtils'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = reactive<AvatarOptions>({ ...parseAvatarString(props.modelValue) })

watch(
  () => props.modelValue,
  (val) => { Object.assign(options, parseAvatarString(val)) },
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function setOption(key: keyof AvatarOptions | null, value: string | null) {
  if (!key) return
  ;(options as Record<string, string | null>)[key] = value
  emit('update:modelValue', serializeAvatarOptions({ ...options }))
}

function cycle(key: keyof AvatarOptions | null, list: (string | null)[] | null, dir: number) {
  if (!key || !list) return
  const val = options[key]
  const idx = list.indexOf(val as string | null)
  const next = idx === -1 ? 0 : (idx + dir + list.length) % list.length
  setOption(key, list[next])
}

interface CategoryDef {
  label: string
  typeKey: keyof AvatarOptions | null
  typeList: (string | null)[] | null
  colorKey: keyof AvatarOptions | null
  colorList: string[] | null
  hideColorWhenNull: boolean
}

function typeLabel(cat: CategoryDef): string {
  if (!cat.typeKey) return ''
  const val = options[cat.typeKey]
  if (val === null) return 'None'
  return formatLabel(val as string)
}

function showColors(cat: CategoryDef): boolean {
  if (!cat.hideColorWhenNull || !cat.typeKey) return true
  return options[cat.typeKey] !== null
}

function isActiveColor(colorKey: keyof AvatarOptions | null, color: string): boolean {
  if (!colorKey) return false
  return options[colorKey] === color
}

// ── Preview ───────────────────────────────────────────────────────────────────

const previewSvg = computed(() => {
  const svg = createAvatar(avataaars, {
    style: ['circle'],
    top: [options.top],
    hairColor: [options.hairColor],
    accessories: options.accessories ? [options.accessories] : [],
    accessoriesProbability: options.accessories ? 100 : 0,
    accessoriesColor: [options.accessoriesColor],
    clothing: [options.clothing],
    clothesColor: [options.clothesColor],
    clothingGraphic: [options.clothingGraphic],
    eyes: [options.eyes],
    eyebrows: [options.eyebrows],
    mouth: [options.mouth],
    facialHair: options.facialHair ? [options.facialHair] : [],
    facialHairProbability: options.facialHair ? 100 : 0,
    facialHairColor: [options.facialHairColor],
    skinColor: [options.skinColor],
    backgroundColor: [options.backgroundColor],
  } as Options).toString()
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
})

function formatLabel(val: string): string {
  return val
    .replace(/([A-Z])/g, ' $1')
    .replace(/(\d+)/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function swatchBg(color: string): Record<string, string> {
  if (color === 'transparent') {
    return { background: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 10px 10px' }
  }
  return { background: '#' + color }
}

// ── Option lists ──────────────────────────────────────────────────────────────

const TOP_OPTIONS = [
  'bigHair','bob','bun','curly','curvy','dreads','dreads01','dreads02',
  'frida','fro','froBand','frizzle','hat','hijab','longButNotTooLong',
  'miaWallace','shaggy','shaggyMullet','shavedSides','shortCurly','shortFlat',
  'shortRound','shortWaved','sides','straight01','straight02','straightAndStrand',
  'theCaesar','theCaesarAndSidePart','turban','winterHat02','winterHat03',
  'winterHat04','winterHat1',
]

const ACCESSORIES_OPTIONS = [
  'eyepatch','kurt','prescription01','prescription02','round','sunglasses','wayfarers',
]

const CLOTHING_OPTIONS = [
  'blazerAndShirt','blazerAndSweater','collarAndSweater','graphicShirt',
  'hoodie','overall','shirtCrewNeck','shirtScoopNeck','shirtVNeck',
]

const CLOTHING_GRAPHIC_OPTIONS = [
  'bat','bear','cumbia','deer','diamond','hola','pizza','resist','skull','skullOutline',
]

const EYES_OPTIONS = [
  'closed','cry','default','eyeRoll','happy','hearts','side',
  'squint','surprised','wink','winkWacky','xDizzy',
]

const EYEBROWS_OPTIONS = [
  'angry','angryNatural','default','defaultNatural','flatNatural','frownNatural',
  'raisedExcited','raisedExcitedNatural','sadConcerned','sadConcernedNatural',
  'unibrowNatural','upDown','upDownNatural',
]

const MOUTH_OPTIONS = [
  'concerned','default','disbelief','eating','grimace','sad',
  'screamOpen','serious','smile','tongue','twinkle','vomit',
]

const FACIAL_HAIR_OPTIONS = [
  'beardLight','beardMajestic','beardMedium','moustacheFancy','moustacheMagnum',
]

const SKIN_COLORS    = ['614335','ae5d29','d08b5b','edb98a','ffdbb4','fd9841','f8d25c']
const HAIR_COLORS    = ['2c1b18','4a312c','724133','a55728','b58143','c93305','d6b370','e8e1e1','ecdcbf','f59797']
const ACCESSORIES_COLORS = ['262e33','3c4f5c','25557c','5199e4','65c9ff','929598','b1e2ff','e6e6e6','ff488e','ff5c5c','ffafb9','ffdeb5','ffffb1','ffffff']
const CLOTHES_COLORS = ['262e33','3c4f5c','25557c','5199e4','65c9ff','929598','a7ffc4','b1e2ff','e6e6e6','ff488e','ff5c5c','ffafb9','ffffb1','ffffff']
const FACIAL_HAIR_COLORS = ['2c1b18','4a312c','724133','a55728','b58143','c93305','d6b370','e8e1e1','ecdcbf','f59797']
const BG_COLORS      = ['transparent','b6e3f4','c0aede','d1d4f9','ffd5dc','ffeba4','a3d977','65c9ff','ff9a00','e8e1e1']

// ── Categories ────────────────────────────────────────────────────────────────

const categories: CategoryDef[] = [
  { label: 'Skin',        typeKey: null,           typeList: null,                              colorKey: 'skinColor',        colorList: SKIN_COLORS,        hideColorWhenNull: false },
  { label: 'Background',  typeKey: null,           typeList: null,                              colorKey: 'backgroundColor', colorList: BG_COLORS,           hideColorWhenNull: false },
  { label: 'Hair',        typeKey: 'top',          typeList: TOP_OPTIONS,                       colorKey: 'hairColor',        colorList: HAIR_COLORS,        hideColorWhenNull: false },
  { label: 'Clothing',    typeKey: 'clothing',     typeList: CLOTHING_OPTIONS,                  colorKey: 'clothesColor',     colorList: CLOTHES_COLORS,      hideColorWhenNull: false },
  { label: 'Glasses',     typeKey: 'accessories',  typeList: [null, ...ACCESSORIES_OPTIONS],    colorKey: 'accessoriesColor', colorList: ACCESSORIES_COLORS,  hideColorWhenNull: true },
  { label: 'Facial hair', typeKey: 'facialHair',   typeList: [null, ...FACIAL_HAIR_OPTIONS],    colorKey: 'facialHairColor',  colorList: FACIAL_HAIR_COLORS,  hideColorWhenNull: true },
  { label: 'Eyes',        typeKey: 'eyes',         typeList: EYES_OPTIONS,                      colorKey: null,               colorList: null,               hideColorWhenNull: false },
  { label: 'Brows',       typeKey: 'eyebrows',     typeList: EYEBROWS_OPTIONS,                  colorKey: null,               colorList: null,               hideColorWhenNull: false },
  { label: 'Mouth',       typeKey: 'mouth',        typeList: MOUTH_OPTIONS,                     colorKey: null,               colorList: null,               hideColorWhenNull: false },
]
</script>

<style scoped>
.avatar-editor {
  display: grid;
  gap: 1.25rem;
}

.preview-area {
  display: flex;
  justify-content: center;
}

.avatar-preview-lg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f3f4f6;
}

/* ── Category grid ─────────────────────────────────────────────────────────── */

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.category-card {
  display: grid;
  gap: 0.4rem;
  padding: 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  align-content: start;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

/* ── Carousel ──────────────────────────────────────────────────────────────── */

.carousel {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.carousel-btn {
  font: inherit;
  font-size: 1.1rem;
  font-weight: 700;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #fff;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s;
}

.carousel-btn:hover  { background: #f3f4f6; }
.carousel-btn:active { background: #e5e7eb; }

.carousel-value {
  flex: 1;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1f2937;
}

.carousel-value-sm {
  font-size: 0.7rem;
}

/* ── Colour swatches ───────────────────────────────────────────────────────── */

.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch.active {
  border-color: #16a34a;
  transform: scale(1.15);
}

/* ── Mobile ────────────────────────────────────────────────────────────────── */

@media (max-width: 480px) {
  .carousel-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
  }

  .carousel-value {
    display: none;
  }

  .carousel {
    justify-content: space-between;
  }

  .swatch {
    width: 26px;
    height: 26px;
  }
}
</style>
