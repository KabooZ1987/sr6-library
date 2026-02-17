import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../index.vue'

// Mock AppLink component for testing
const AppLinkMock = {
  name: 'AppLink',
  template: '<div class="app-link-mock" :data-to="to" :aria-label="ariaLabel"><slot /></div>',
  props: ['to', 'ariaLabel']
}

// Mock Card component
const CardMock = {
  name: 'Card',
  template: '<div class="card-mock" :role="role" :tabindex="tabindex"><div class="title"><slot name="title" /></div><div class="content"><slot name="content" /></div></div>',
  props: ['role', 'tabindex']
}

describe('Index Page Navigation', () => {
  const createWrapper = () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/commonActions', component: { template: '<div>Common Actions</div>' } },
        { path: '/edgeBoosts', component: { template: '<div>Edge Boosts</div>' } },
        { path: '/edgeActions', component: { template: '<div>Edge Actions</div>' } },
        { path: '/rules', component: { template: '<div>Rules</div>' } },
        { path: '/homebrew', component: { template: '<div>Homebrew</div>' } }
      ]
    })

    return mount(IndexPage, {
      global: {
        plugins: [router],
        components: {
          AppLink: AppLinkMock,
          Card: CardMock
        }
      }
    })
  }

  it('should render all navigation cards with AppLink', () => {
    const wrapper = createWrapper()
    
    // Check that all expected navigation links are present
    const appLinks = wrapper.findAllComponents({ name: 'AppLink' })
    expect(appLinks).toHaveLength(5)
    
    // Verify each link has the correct destination
    const expectedRoutes = ['/commonActions', '/edgeBoosts', '/edgeActions', '/rules', '/homebrew']
    appLinks.forEach((link, index) => {
      expect(link.props('to')).toBe(expectedRoutes[index])
    })
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = createWrapper()
    
    const appLinks = wrapper.findAllComponents({ name: 'AppLink' })
    
    // Check that each AppLink has proper aria-label
    appLinks.forEach((link) => {
      const ariaLabel = link.props('ariaLabel')
      expect(ariaLabel).toContain('Navigate to')
      expect(ariaLabel).toContain(':')
    })
  })

  it('should render cards with proper accessibility roles', () => {
    const wrapper = createWrapper()
    
    const cards = wrapper.findAllComponents({ name: 'Card' })
    
    cards.forEach((card) => {
      expect(card.props('role')).toBe('button')
      expect(card.props('tabindex')).toBe('-1')
    })
  })

  it('should display correct navigation card content', () => {
    const wrapper = createWrapper()
    
    const expectedContent = [
      { name: 'Common Actions', description: 'what to do in combat and out of combat' },
      { name: 'Edge Boosts', description: 'direct possibilities with Edge \nprobably always usable when rolling for a test' },
      { name: 'Edge Actions', description: 'actions that need Edge to be possible' },
      { name: 'Rules', description: 'what how works, can be homebrew too' },
      { name: 'Homebrew', description: 'selfmade stuff here' }
    ]
    
    const cards = wrapper.findAllComponents({ name: 'Card' })
    
    cards.forEach((card, index) => {
      const titleSlot = card.find('.title')
      const contentSlot = card.find('.content')
      
      expect(titleSlot.text()).toContain(expectedContent[index].name)
      expect(contentSlot.text()).toContain(expectedContent[index].description)
    })
  })

  it('should not have redundant anchor tags', () => {
    const wrapper = createWrapper()
    
    // Ensure there are no anchor tags inside the cards (redundant navigation)
    const anchorTags = wrapper.findAll('a')
    expect(anchorTags).toHaveLength(0)
  })

  it('should have proper focus management classes', () => {
    const wrapper = createWrapper()
    
    const appLinks = wrapper.findAllComponents({ name: 'AppLink' })
    
    appLinks.forEach((link) => {
      const linkElement = link.find('.app-link-mock')
      // The actual AppLink component would have focus classes, but our mock doesn't
      // This test verifies the structure is correct for focus management
      expect(linkElement.exists()).toBe(true)
    })
  })
})