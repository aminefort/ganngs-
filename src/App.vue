<script setup lang="ts">
import Header from "./components/Header.vue";
import AllGangs from "./pages/AllGangs.vue";
import DarkWeb from "./pages/DarkWeb.vue";
import Territories from "./pages/Territories.vue";
import YourGang from "./pages/YourGang.vue";
import { useGlobalState } from "./stores/globalStore";
import { ref } from 'vue';

const globalState = useGlobalState();

const menuItems = ref([
  {
    key: 'yourGang',
    title: 'MEMBERS',
    subtitle: 'Manage your crew',
    image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg'
  },
  {
    key: 'allGangs',
    title: 'RANKS',
    subtitle: 'Manage your crew',
    image: 'https://images.pexels.com/photos/2760244/pexels-photo-2760244.jpeg'
  },
  {
    key: 'territories',
    title: 'TURF',
    subtitle: 'Control your territories',
    image: 'https://images.pexels.com/photos/2760245/pexels-photo-2760245.jpeg'
  },
  {
    key: 'darkWeb',
    title: 'BLACK MARKET',
    subtitle: 'Underground dealings',
    image: 'https://images.pexels.com/photos/2760246/pexels-photo-2760246.jpeg'
  }
]);
</script>

<template>
  <div class="app-frame" v-if="globalState.visible.value">
    <Header />
    <div class="app-content">
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="app-logo">
            <img src="https://images.pexels.com/photos/2760247/pexels-photo-2760247.jpeg" alt="Logo" />
            <h1>HIDEOUT</h1>
          </div>
          <div class="app-subtitle">HOME</div>
        </div>

        <div class="menu-section">
          <div 
            v-for="(item, index) in menuItems" 
            :key="index"
            class="menu-item"
            :class="{ active: globalState.currentTab.value === item.key }"
            @click="globalState.currentTab.value = item.key"
          >
            <div class="menu-item-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.subtitle }}</p>
            </div>
            <div class="menu-item-indicator"></div>
          </div>
        </div>


      </div>

      <div class="content-area" :class="{ 'no-padding': globalState.currentTab.value === 'territories' }">
        <Suspense>
          <YourGang v-if="globalState.currentTab.value === 'yourGang'" />
        </Suspense>
        <AllGangs v-if="globalState.currentTab.value === 'allGangs'" />
        <Territories v-if="globalState.currentTab.value === 'territories'" />
        <DarkWeb v-if="globalState.currentTab.value === 'darkWeb'" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-frame {
  width: 1200px;
  height: 800px;
  background: rgba(13, 17, 23, 0.98);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}

.app-content {
  display: flex;
  flex: 1;
  background: #0d0d0d;
  
  .sidebar {
    width: 300px;
    background-color: #0a0a0a;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.1);

    .sidebar-header {
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .app-logo {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;

        img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }

        h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
          letter-spacing: 1px;
        }
      }

      .app-subtitle {
        color: #666;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 2px;
      }
    }

    .menu-section {
      flex: 1;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .menu-item {
        position: relative;
        padding: 1rem 1.5rem;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.03);

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        &.active {
          background: rgba(255, 255, 255, 0.08);
          
          .menu-item-indicator {
            background: #00ff9d;
          }

          h3 {
            color: #fff;
          }
        }

        .menu-item-content {
          h3 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #888;
            letter-spacing: 1px;
          }

          p {
            margin: 0.5rem 0 0;
            font-size: 0.8rem;
            color: #666;
          }
        }

        .menu-item-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: transparent;
          border-radius: 0 2px 2px 0;
          transition: all 0.3s ease;
        }
      }
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .level-info {
        margin-bottom: 1rem;

        .level-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .level-progress {
          .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            margin-bottom: 0.5rem;

            .progress {
              height: 100%;
              background: #00ff9d;
              border-radius: 2px;
              transition: width 0.3s ease;
            }
          }

          span {
            font-size: 0.8rem;
            color: #666;
          }
        }
      }

      .daily-limit {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        color: #888;
        font-size: 0.9rem;
      }
    }
  }

  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background-color: #0f0f0f;

    &.no-padding {
      padding: 0;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.03);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>