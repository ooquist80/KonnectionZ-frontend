<template>
  <div class="avatar-editor">
    <!-- Live preview -->
    <div class="preview-area">
      <img :src="previewSvg" alt="Avatar preview" class="avatar-preview-lg" />
    </div>

    <!-- Option sections -->
    <div class="sections">

      <div class="option-group">
        <span class="option-label">Skin colour</span>
        <div class="swatch-row">
          <button
            v-for="color in SKIN_COLORS"
            :key="color"
            type="button"
            class="swatch"
            :class="{ active: options.skinColor === color }"
            :style="{ background: '#' + color }"
            @click="set('skinColor', color)"
          />
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Hair / Top</span>
        <div class="chip-row">
          <button
            v-for="val in TOP_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.top === val }"
            @click="set('top', val)"
          >{{ label(val) }}</button>
        </div>
        <div class="swatch-row mt-xs">
          <button
            v-for="color in HAIR_COLORS"
            :key="color"
            type="button"
            class="swatch"
            :class="{ active: options.hairColor === color }"
            :style="{ background: '#' + color }"
            @click="set('hairColor', color)"
          />
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Eyes</span>
        <div class="chip-row">
          <button
            v-for="val in EYES_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.eyes === val }"
            @click="set('eyes', val)"
          >{{ label(val) }}</button>
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Eyebrows</span>
        <div class="chip-row">
          <button
            v-for="val in EYEBROWS_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.eyebrows === val }"
            @click="set('eyebrows', val)"
          >{{ label(val) }}</button>
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Mouth</span>
        <div class="chip-row">
          <button
            v-for="val in MOUTH_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.mouth === val }"
            @click="set('mouth', val)"
          >{{ label(val) }}</button>
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Accessories</span>
        <div class="chip-row">
          <button
            type="button"
            class="chip"
            :class="{ active: options.accessories === null }"
            @click="set('accessories', null)"
          >None</button>
          <button
            v-for="val in ACCESSORIES_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.accessories === val }"
            @click="set('accessories', val)"
          >{{ label(val) }}</button>
        </div>
        <Transition name="fade">
          <div v-if="options.accessories !== null" class="swatch-row mt-xs">
            <button
              v-for="color in ACCESSORIES_COLORS"
              :key="color"
              type="button"
              class="swatch"
              :class="{ active: options.accessoriesColor === color }"
              :style="{ background: '#' + color }"
              @click="set('accessoriesColor', color)"
            />
          </div>
        </Transition>
      </div>

      <div class="option-group">
        <span class="option-label">Clothing</span>
        <div class="chip-row">
          <button
            v-for="val in CLOTHING_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.clothing === val }"
            @click="set('clothing', val)"
          >{{ label(val) }}</button>
        </div>
        <div class="swatch-row mt-xs">
          <button
            v-for="color in CLOTHES_COLORS"
            :key="color"
            type="button"
            class="swatch"
            :class="{ active: options.clothesColor === color }"
            :style="{ background: '#' + color }"
            @click="set('clothesColor', color)"
          />
        </div>
        <Transition name="fade">
          <div v-if="options.clothing === 'graphicShirt'" class="chip-row mt-xs">
            <button
              v-for="val in CLOTHING_GRAPHIC_OPTIONS"
              :key="val"
              type="button"
              class="chip"
              :class="{ active: options.clothingGraphic === val }"
              @click="set('clothingGraphic', val)"
            >{{ label(val) }}</button>
          </div>
        </Transition>
      </div>

      <div class="option-group">
        <span class="option-label">Facial hair</span>
        <div class="chip-row">
          <button
            type="button"
            class="chip"
            :class="{ active: options.facialHair === null }"
            @click="set('facialHair', null)"
          >None</button>
          <button
            v-for="val in FACIAL_HAIR_OPTIONS"
            :key="val"
            type="button"
            class="chip"
            :class="{ active: options.facialHair === val }"
            @click="set('facialHair', val)"
          >{{ label(val) }}</button>
        </div>
        <Transition name="fade">
          <div v-if="options.facialHair !== null" class="swatch-row mt-xs">
            <button
              v-for="color in FACIAL_HAIR_COLORS"
              :key="color"
              type="button"
              class="swatch"
              :class="{ active: options.facialHairColor === color }"
              :style="{ background: '#' + color }"
              @click="set('facialHairColor', color)"
            />
          </div>
        </Transition>
      </div>

      <div class="option-group">
        <span class="option-label">Background</span>
        <div class="swatch-row">
          <button
            v-for="color in BG_COLORS"
            :key="color"
            type="button"
            class="swatch"
            :class="{ active: options.backgroundColor === color }"
            :style="swatchBg(color)"
            @click="set('backgroundColor', color)"
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

function set<K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) {
  options[key] = value
  emit('update:modelValue', serializeAvatarOptions({ ...options }))
}

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

function label(val: string): string {
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

.sections {
  display: grid;
  gap: 1rem;
}

.option-group {
  display: grid;
  gap: 0.4rem;
}

.option-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

/* Chips */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  font: inherit;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  background: #fff;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.chip:hover {
  background: #f3f4f6;
}

.chip.active {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

/* Colour swatches */
.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.swatch {
  width: 24px;
  height: 24px;
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

.mt-xs {
  margin-top: 0.25rem;
}

/* Fade transition for conditional colour rows */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
