<template>
    <header :class="{ 'scrolled-nav': scrollNav, 'bg-zinc-800':true, 'text-fuchsia-700':true  }" role="banner">
        <div class="logo">
            <color-mode-button />
            <span>SR6</span>
        </div>
        <nav role="navigation" aria-label="Main navigation">
            <ul v-show="!Tablet" class="navigation" role="menubar">
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/" 
                        exact
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Home page"
                        role="menuitem"
                    >
                        Home
                    </NavigationLink>
                </li>
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/commonActions"
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Actions page"
                        role="menuitem"
                    >
                        Actions
                    </NavigationLink>
                </li>
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/edgeBoosts"
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Edge boosts page"
                        role="menuitem"
                    >
                        Edge boosts
                    </NavigationLink>
                </li>
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/edgeActions"
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Edge actions page"
                        role="menuitem"
                    >
                        Edge actions
                    </NavigationLink>
                </li>
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/rules"
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Rules page"
                        role="menuitem"
                    >
                        Rules
                    </NavigationLink>
                </li>
                <li role="none">
                    <NavigationLink 
                        class="link" 
                        to="/homeBrew"
                        active-class="router-link-exact-active"
                        aria-label="Navigate to Homebrew page"
                        role="menuitem"
                    >
                        Homebrew
                    </NavigationLink>
                </li>
            </ul>
        
            <button 
                @click="toggleMobileNav" 
                v-show="Tablet" 
                :class="['mobile-nav-toggle', 'transition-transform duration-300', mobileNavOpen ? 'rotate-90 origin-center' : '']"
                :aria-expanded="mobileNavOpen"
                aria-controls="mobile-navigation"
                aria-label="Toggle mobile navigation menu"
                type="button"
            >
                <i :class="[PrimeIcons.BARS,'text-2xl' ]" aria-hidden="true" />
            </button>
            
            <transition name="mobile-nav">
                <ul 
                    v-show="mobileNavOpen" 
                    id="mobile-navigation"
                    class="sideBar bg-zinc-800 text-fuchsia-700" 
                    role="menu"
                    aria-label="Mobile navigation menu"
                    @click="handleMobileNavClick"
                >
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/" 
                            exact
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Home page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Home
                        </NavigationLink>
                    </li>
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/commonActions"
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Actions page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Actions
                        </NavigationLink>
                    </li>
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/edgeBoosts"
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Edge boosts page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Edge boosts
                        </NavigationLink>
                    </li>
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/edgeActions"
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Edge actions page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Edge actions
                        </NavigationLink>
                    </li>
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/rules"
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Rules page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Rules
                        </NavigationLink>
                    </li>
                    <li role="none">
                        <NavigationLink 
                            class="link" 
                            to="/homeBrew"
                            active-class="router-link-exact-active"
                            aria-label="Navigate to Homebrew page"
                            role="menuitem"
                            @click="closeMobileNav"
                        >
                            Homebrew
                        </NavigationLink>
                    </li>
                </ul>
            </transition>
        </nav>
    </header>

    <main role="main">
        <slot />
    </main>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { PrimeIcons } from '@primevue/core/api';

const scrollNav = ref(false);
const Tablet = ref(false);
const mobileNavOpen = ref(false);
const windowWidth = ref(false);

if (typeof window !== "undefined") {
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("scroll", updateScroll);
    window.addEventListener("keydown", handleKeydown);
}

onMounted(() => {        
    checkScreenSize();
});

function updateScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
        scrollNav.value = true;
    } else {
        scrollNav.value = false;
    }
}

function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value;
}

function closeMobileNav() {
    mobileNavOpen.value = false;
}

function handleMobileNavClick(event) {
    // Only close if clicking on a navigation link, not the container
    if (event.target.closest('.link')) {
        closeMobileNav();
    }
}

function handleKeydown(event) {
    // Close mobile navigation on Escape key
    if (event.key === 'Escape' && mobileNavOpen.value) {
        closeMobileNav();
        // Focus the mobile nav toggle button after closing
        const toggleButton = document.querySelector('.mobile-nav-toggle');
        if (toggleButton) {
            toggleButton.focus();
        }
    }
}

function checkScreenSize() {
    windowWidth.value = window.innerWidth;
    if (windowWidth.value <= 1094) {
        Tablet.value = true;
    } else {
        Tablet.value = false;
        mobileNavOpen.value = false;
    }
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 4rem;
    z-index: 40;
    width: 100%;
    padding: 0 2%;
    position: fixed;
    top: 0;
    transition: 0.5s ease all;

    .logo {
        margin-right: auto;
        display: flex;
        align-items: center;

        span {
            font-size: 32px;
            font-weight: 800;
            transition: 0.5s ease all;
            padding: 0 16px;
        }
    }

    nav {
        position: relative;
        display: flex;
        transition: 0.5s ease all;

        @media (min-width: 1140px) {
            max-width: 1140px;
        }

        ul,
        .link {
            font-weight: 600;
            list-style: none;
            text-decoration: none;
        }

        .navigation {
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: flex-end;

            li {
                text-transform: uppercase;
                padding: 0 16px;
                margin-left: 16px;

                .link {
                    font-size: 15px;
                    transition: 0.5s ease all;
                    padding-bottom: 4px;

                    &:hover,
                    &.router-link-exact-active {
                        transition: 0.5s ease-out;
                    }
                }
            }
        }

        .mobile-nav-toggle {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.25rem;
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            &:focus,
            &:focus-visible {
                outline: 2px solid #fbbf24;
                outline-offset: 2px;
            }

            &:focus:not(:focus-visible) {
                outline: none;
            }

            &:active {
                transform: scale(0.95);
            }
        }

        .sideBar {
            display: flex;
            flex-direction: column;
            position: fixed;
            width: 100%;
            max-width: 250px;
            height: 100%; 
            top: 4rem;
            left: 0;
            z-index: 50;

            li {
                .link {
                    padding: 0.75rem 1rem;
                    display: flex;
                    font-size: 20px;
                    min-height: 44px;
                    align-items: center;
                    transition: all 0.3s ease;

                    &:hover,
                    &.router-link-exact-active {
                        color: #fafafa;
                        background-color:#a21caf;
                    }

                    &.router-link-exact-active {
                        border-right: solid #4a044e 0.4rem;
                    }

                    &:focus,
                    &:focus-visible {
                        outline: 2px solid #fbbf24;
                        outline-offset: -2px;
                    }

                    &:focus:not(:focus-visible) {
                        outline: none;
                    }
                }
            }
        }

        .mobile-nav-enter-active,
        .mobile-nav-leave-active {
            transition: 1s ease all;
        }

        .mobile-nav-enter-from,
        .mobile-nav-leave-to {
            transform: translateX(-250px);
        }

        .mobile-nav-enter-to {
            transform: translateX(0);
        }
    }
}

.scrolled-nav {
    background-color: black;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);

    .logo {
        span {
            font-size: 20px;
        }
    }

    nav {
        .burger-Menu span {
            font-size: 20px;
        }

        .navigation {
            li {
                .link {
                    font-size: 10px;

                    &:hover,
                    &.router-link-exact-active {
                        color: rgb(4, 180, 19);
                        border-color: rgb(4, 180, 19);
                        transition: 0.5s ease-out;
                    }
                }
            }
        }
    }
}
</style>
