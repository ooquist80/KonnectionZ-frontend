import { createAvatar, type Options } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars'

export interface AvatarOptions {
  top: string
  hairColor: string
  accessories: string | null
  accessoriesColor: string
  clothing: string
  clothesColor: string
  clothingGraphic: string
  eyes: string
  eyebrows: string
  mouth: string
  facialHair: string | null
  facialHairColor: string
  skinColor: string
  backgroundColor: string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const TOP_OPTIONS = ['bigHair','bob','bun','curly','curvy','dreads','dreads01','dreads02','frida','fro','froBand','frizzle','hat','hijab','longButNotTooLong','miaWallace','shaggy','shaggyMullet','shavedSides','shortCurly','shortFlat','shortRound','shortWaved','sides','straight01','straight02','straightAndStrand','theCaesar','theCaesarAndSidePart','turban','winterHat02','winterHat03','winterHat04','winterHat1']
const ACCESSORIES_OPTIONS = ['eyepatch','kurt','prescription01','prescription02','round','sunglasses','wayfarers']
const CLOTHING_OPTIONS = ['blazerAndShirt','blazerAndSweater','collarAndSweater','graphicShirt','hoodie','overall','shirtCrewNeck','shirtScoopNeck','shirtVNeck']
const CLOTHING_GRAPHIC_OPTIONS = ['bat','bear','cumbia','deer','diamond','hola','pizza','resist','skull','skullOutline']
const EYES_OPTIONS = ['closed','cry','default','eyeRoll','happy','hearts','side','squint','surprised','wink','winkWacky','xDizzy']
const EYEBROWS_OPTIONS = ['angry','angryNatural','default','defaultNatural','flatNatural','frownNatural','raisedExcited','raisedExcitedNatural','sadConcerned','sadConcernedNatural','unibrowNatural','upDown','upDownNatural']
const MOUTH_OPTIONS = ['concerned','default','disbelief','eating','grimace','sad','screamOpen','serious','smile','tongue','twinkle','vomit']
const FACIAL_HAIR_OPTIONS = ['beardLight','beardMajestic','beardMedium','moustacheFancy','moustacheMagnum']
const SKIN_COLORS = ['614335','ae5d29','d08b5b','edb98a','ffdbb4','fd9841','f8d25c']
const HAIR_COLORS = ['2c1b18','4a312c','724133','a55728','b58143','c93305','d6b370','e8e1e1','ecdcbf','f59797']
const ACCESSORIES_COLORS = ['262e33','3c4f5c','25557c','5199e4','65c9ff','929598','b1e2ff','e6e6e6','ff488e','ff5c5c','ffafb9','ffdeb5','ffffb1','ffffff']
const CLOTHES_COLORS = ['262e33','3c4f5c','25557c','5199e4','65c9ff','929598','a7ffc4','b1e2ff','e6e6e6','ff488e','ff5c5c','ffafb9','ffffb1','ffffff']
const FACIAL_HAIR_COLORS = ['2c1b18','4a312c','724133','a55728','b58143','c93305','d6b370','e8e1e1','ecdcbf','f59797']
const BG_COLORS = ['transparent','b6e3f4','c0aede','d1d4f9','ffd5dc','ffeba4','a3d977','65c9ff','ff9a00','e8e1e1']

export function randomizeAvatarOptions(): AvatarOptions {
  const hasAccessory = Math.random() < 0.4
  const hasFacialHair = Math.random() < 0.4
  return {
    top: pick(TOP_OPTIONS),
    hairColor: pick(HAIR_COLORS),
    accessories: hasAccessory ? pick(ACCESSORIES_OPTIONS) : null,
    accessoriesColor: pick(ACCESSORIES_COLORS),
    clothing: pick(CLOTHING_OPTIONS),
    clothesColor: pick(CLOTHES_COLORS),
    clothingGraphic: pick(CLOTHING_GRAPHIC_OPTIONS),
    eyes: pick(EYES_OPTIONS),
    eyebrows: pick(EYEBROWS_OPTIONS),
    mouth: pick(MOUTH_OPTIONS),
    facialHair: hasFacialHair ? pick(FACIAL_HAIR_OPTIONS) : null,
    facialHairColor: pick(FACIAL_HAIR_COLORS),
    skinColor: pick(SKIN_COLORS),
    backgroundColor: pick(BG_COLORS),
  }
}

export const DEFAULT_AVATAR_OPTIONS: AvatarOptions = {
  top: 'shortFlat',
  hairColor: 'd6b370',
  accessories: null,
  accessoriesColor: '929598',
  clothing: 'hoodie',
  clothesColor: '65c9ff',
  clothingGraphic: 'pizza',
  eyes: 'default',
  eyebrows: 'default',
  mouth: 'smile',
  facialHair: null,
  facialHairColor: 'a55728',
  skinColor: 'edb98a',
  backgroundColor: 'b6e3f4',
}

export function parseAvatarString(avatarStr: string): AvatarOptions {
  try {
    const parsed = JSON.parse(avatarStr)
    if (parsed && typeof parsed === 'object' && 'top' in parsed) {
      return { ...DEFAULT_AVATAR_OPTIONS, ...parsed }
    }
  } catch {
    // old seed format — fall through to defaults
  }
  return { ...DEFAULT_AVATAR_OPTIONS }
}

export function serializeAvatarOptions(options: AvatarOptions): string {
  return JSON.stringify(options)
}

export function buildAvatarSvg(avatarStr: string): string {
  let svg: string
  try {
    const parsed = JSON.parse(avatarStr)
    if (parsed && typeof parsed === 'object' && 'top' in parsed) {
      const o: AvatarOptions = { ...DEFAULT_AVATAR_OPTIONS, ...parsed }
      svg = createAvatar(avataaars, {
        style: ['circle'],
        top: [o.top],
        hairColor: [o.hairColor],
        accessories: o.accessories ? [o.accessories] : [],
        accessoriesProbability: o.accessories ? 100 : 0,
        accessoriesColor: [o.accessoriesColor],
        clothing: [o.clothing],
        clothesColor: [o.clothesColor],
        clothingGraphic: [o.clothingGraphic],
        eyes: [o.eyes],
        eyebrows: [o.eyebrows],
        mouth: [o.mouth],
        facialHair: o.facialHair ? [o.facialHair] : [],
        facialHairProbability: o.facialHair ? 100 : 0,
        facialHairColor: [o.facialHairColor],
        skinColor: [o.skinColor],
        backgroundColor: [o.backgroundColor],
      } as Options).toString()
    } else {
      throw new Error('not options format')
    }
  } catch {
    // old seed string
    svg = createAvatar(avataaars, { seed: avatarStr, style: ['circle'] }).toString()
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
