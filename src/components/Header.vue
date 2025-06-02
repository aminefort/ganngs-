<script setup lang="ts">
import { useGlobalState } from '../stores/globalStore';
import { fetchNui } from '../utils';

const globalState = useGlobalState();

const closeUI = () => {
  fetchNui("close");
  globalState.visible.value = false;
};
</script>

<template>
  <div class="header">
    <div class="header-content">
      <div class="app-info">
        <img src="https://images.pexels.com/photos/2760247/pexels-photo-2760247.jpeg" alt="App Icon" class="app-icon" />
        <div class="app-text">
          <span class="app-name">Application</span>
          <span class="app-title">Hideout</span>
        </div>
      </div>
      <div class="header-description">
        Manage the Hideout and unlock new features
      </div>
    </div>
    <div class="actions">
      <button @click="closeUI" class="close-btn">
        <span>×</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header {
  height: 60px;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    display: flex;
    align-items: center;
    gap: 2rem;

    .app-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .app-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
      }

      .app-text {
        display: flex;
        flex-direction: column;

        .app-name {
          font-size: 0.8rem;
          color: #666;
        }

        .app-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
        }
      }
    }

    .header-description {
      color: #666;
      font-size: 0.9rem;
    }
  }

  .actions {
    .close-btn {
      background: none;
      border: none;
      color: #666;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border-radius: 6px;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }
    }
  }
}
</style>