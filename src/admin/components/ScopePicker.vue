<template>
  <div class="scope-picker">
    <button
      v-for="scope in assignableScopes"
      :key="scope"
      type="button"
      class="scope-option"
      :class="[selectedClass(scope), { 'scope-option--selected': isSelected(scope) }]"
      :aria-pressed="isSelected(scope)"
      @click="toggleScope(scope)"
    >
      <span class="scope-option-indicator" aria-hidden="true">
        {{ isSelected(scope) ? '✓' : '+' }}
      </span>
      <span>{{ formatScopeLabel(scope) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { assignableScopes, formatScopeLabel, type AssignableScope } from '../../shared/auth/permissions'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function toggleScope(scope: AssignableScope) {
  if (props.modelValue.includes(scope)) {
    emit('update:modelValue', props.modelValue.filter((item) => item !== scope))
    return
  }

  emit('update:modelValue', [...props.modelValue, scope])
}

function isSelected(scope: AssignableScope): boolean {
  return props.modelValue.includes(scope)
}

function badgeClass(scope: AssignableScope): string {
  if (scope === 'user:player') {
    return 'scope-option--player'
  }

  if (scope === 'user:gamemaster') {
    return 'scope-option--gamemaster'
  }

  return 'scope-option--admin'
}

function selectedClass(scope: AssignableScope): string {
  return isSelected(scope) ? badgeClass(scope) : 'scope-option--unselected'
}
</script>

<style scoped>
.scope-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.scope-option {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--kz-border);
  background: var(--kz-glass-strong);
  color: var(--kz-text);
  font-size: 0.85rem;
  font-weight: 600;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease;
}

.scope-option:hover {
  transform: translateY(-1px);
}

.scope-option--unselected {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--kz-text-muted);
}

.scope-option--selected {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.12);
}

.scope-option-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.16);
}

.scope-option--unselected .scope-option-indicator {
  background: rgba(255, 255, 255, 0.08);
  color: var(--kz-text-faint);
}

.scope-option--player {
  background: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.scope-option--gamemaster {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.scope-option--admin {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6d28d9;
}
</style>
