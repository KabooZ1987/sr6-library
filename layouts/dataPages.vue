<template>
    <header :class="{ 'scrolled-nav': scrollNav }">
        <div class="logo">
            <span>uLogo</span>
        </div>
        
        <nav>
            <ul v-show="!Tablet" class="navigation">
                <li>
                    <NuxtLink  class="link" to="/">Home</NuxtLink >
                </li>
                <li>
                    <NuxtLink class="link" to="/edgeBoosts">edge boosts</NuxtLink >
                </li>
                <li>
                    <NuxtLink  class="link" to="/edgeActions">edge actions</NuxtLink>
                </li>
                <li>
                    <NuxtLink  class="link" to="/rules">rules</NuxtLink >
                </li>
                <li>
                    <NuxtLink  class="link" to="/homeBrew">homebrew</NuxtLink >
                </li>
            </ul>
            <div class="burger-Menu">
                <span @click="toggleMobileNav" v-show="Tablet" :class="{ 'icon-active': mobileNavOpen }">
                    <client-only>
                        <font-awesome-icon :icon="['fas', 'bars']" />
                    </client-only>
                </span>
                <!-- <span @click="toggleMobileNav" v-show="mobile"  :class="{'icon-active' : mobileNavOpen}">menu</span> -->
            </div>
            <transition name="mobile-nav">
                <ul v-show="mobileNavOpen" class="sideBar">
                    <li>
                        <NuxtLink  class="link" to="/">
                            <p>Home</p>
                        </NuxtLink >
                    </li>
                    <li>
                        <NuxtLink  class="link" to="/edgeBoosts">
                            <p>edge boosts</p>
                        </NuxtLink >
                    </li>
                    <li>
                        <NuxtLink  class="link" to="/edgeActions">
                            <p>edge actions</p>
                        </NuxtLink >
                    </li>
                    <li>
                        <NuxtLink  class="link" to="/rules">
                           <p>rules</p> 
                        </NuxtLink >
                    </li>
                    <li>
                        <NuxtLink  class="link" to="/homeBrew">
                            <p>homebrew</p>
                        </NuxtLink >
                    </li>
                </ul>
            </transition>
        </nav>
    </header>

    <main>
        <slot />
    </main>



</template>


<script setup>
import { ref, onMounted } from 'vue'

const scrollNav = ref(false)
const Tablet = ref(false)
const mobileNavOpen = ref(false)
const windowWidth = ref(false)

if (typeof window !== 'undefined') {

    window.addEventListener("resize", checkScreenSize)


    onMounted(() => {

        window.addEventListener("scroll", updateScroll)

    });
}


function updateScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
        scrollNav.value = true;
        
    } else {

        scrollNav.value = false;
        
    }
}
function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value
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
    background-color: rgba(4, 180, 19, 0.616);
    color: white;
    z-index: 99;
    width: 100%;
    padding: 15px 2%;
    position: fixed;
    top: 0;
    transition: .5s ease all;
   

    .logo {
        margin-right: auto;
        display: flex;
        align-items: center;

        span {
            font-size: 32px;
            font-weight: 800;
            transition: .5s ease all;
            padding: 0 16px;
        }
    }

    nav {
        position: relative;
        display: flex;
        transition: .5s ease all;

        @media (min-width: 1140px) {
            max-width: 1140px;

        }

        ul,
        .link {
            font-weight: 600;
            color: white;
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
                    transition: .5s ease all;
                    padding-bottom: 4px;
                    

                    &:hover,  &.router-link-exact-active {
                        color: rgb(19, 58, 15);
                        transition: .5s ease-out;
                    }
                }
            }
        }

        .burger-Menu {
            display: flex;
            align-items: center;
            position: absolute;
            top: 0;
            right: 24px;
            height: 100%;


            span {
                cursor: pointer;
                font-size: 25px;
                transition: .8s ease all;

            }

        }

        .icon-active {
            transform: rotate(180deg);
        }

        .sideBar {
            display: flex;
            flex-direction: column;
            position: fixed;
            width: 100%;
            max-width: 250px;
            height: 100%;
            background-color: rgb(4, 180, 19);
            top: 0;
            left: 0;

            li {
                
                
                
                .link {
                    padding: 0.5rem 1rem;
                    display: flex;
                    font-size: 20px;
                    
                    color: white;
                    padding-bottom: 4px;
                    p{
                        transition: .5s ease-out;
                    }
                    
                    &:hover,  &.router-link-exact-active {
                        color:  rgb(18, 97, 8);
                        background-color: rgba(104, 226, 114, 0.712);
                    }

                    &.router-link-exact-active{
                        border-right: solid rgb(18, 97, 8) 5px;
                        
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);



    .logo {

        span {
            font-size: 20px;
        }

    }

    nav {
        .berger-Menu span {
            font-size: 20px;
        }

        .navigation {


            li {


                .link {
                    font-size: 10px;
                    &:hover, &.router-link-exact-active  {
                        color: rgb(4, 180, 19);
                        border-color:  rgb(4, 180, 19);
                        transition: .5s ease-out;
                    }
                }
            }
        }
    }
}
</style>