<script setup lang="ts">
import DataView from "primevue/dataview";
import { ref, onMounted } from "vue";
import { fetchNui } from "../utils";
import locale from "../locale";
import { useGlobalState } from "../stores/globalStore";

const globalState = useGlobalState();
const gangs = ref();

onMounted(async () => {
  const allGangs = await fetchNui("getAllGangs");
  if (allGangs) {
    gangs.value = Object.values(allGangs);
  }

  sortOptions = [
    {
      label: locale("AllGangs", "power"),
      value: 'power',
    },
    {
      label: locale("AllGangs", "members"),
      value: 'members',
    },
    {
      label: locale("AllGangs", "zones"),
      value: 'zones',
    },
  ];
});

let sortOptions = [];

const onSortChange = (event) => {
  const value = event.value.value;
  const sortValue = event.value;

  currentSort.value = value;
  currentSortKey.value = sortValue;
};

const currentSort = ref('power');
const currentSortKey = ref(sortOptions[0]);
</script>

<template>
  <div class="gangs-container">
    <div class="gangs-header">
      <div class="header-content">
        <h2>{{ locale("AllGangs", "title") }}</h2>
        <p class="subtitle">{{ locale("AllGangs", "subtitle") }}</p>
      </div>
      <Dropdown 
        v-model="currentSortKey" 
        :options="sortOptions" 
        optionLabel="label" 
        placeholder="Sort by" 
        class="sort-dropdown"
        @change="onSortChange($event)"
      />
    </div>

    <DataView :value="gangs" :sortField="currentSort" :sortOrder="-1">
      <template #list="slotProps">
        <div class="gangs-grid">
          <div v-for="(item, index) in slotProps.items" :key="index" class="gang-card">
            <div class="gang-card-header">
              <div class="logo-wrapper">
                <Avatar
                  :image="item.logo"
                  size="large"
                  class="gang-logo"
                />
                <div class="status-indicator" :style="{ background: `#${item.color}` }"></div>
              </div>
              <div class="gang-info">
                <h3>{{ item.name }}</h3>
                <Tag 
                  :value="item.shortName" 
                  class="gang-tag"
                  :style="{
                    background: `#${item.color}20`,
                    color: `#${item.color}`,
                    border: `1px solid #${item.color}40`
                  }"
                />
              </div>
            </div>

            <div class="gang-stats">
              <div class="stat-item">
                <div class="stat-icon power-icon">
                  <i class="pi pi-bolt"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ locale("AllGangs", "power") }}</span>
                  <span class="stat-value">{{ item.power }}</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon territories-icon">
                  <i class="pi pi-map"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ locale("AllGangs", "territories") }}</span>
                  <span class="stat-value">{{ item.territories.length }}</span>
                </div>
              </div>

              <div class="stat-item" v-if="globalState.canSeeMemberCount.value">
                <div class="stat-icon members-icon">
                  <i class="pi pi-users"></i>
                </div>
                <div class="stat-info">
                  <span class="stat-label">{{ locale("AllGangs", "members") }}</span>
                  <span class="stat-value">{{ item.members.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style scoped lang="scss">
.gangs-container {
  height: 100%;
  color: white;
  padding: 2rem;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);

  .gangs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;

    .header-content {
      h2 {
        margin: 0;
        font-size: 1.8rem;
        color: #00ff9d;
        font-weight: 600;
        letter-spacing: -0.5px;
      }

      .subtitle {
        margin: 0.5rem 0 0 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
      }
    }

    .sort-dropdown {
      min-width: 180px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(255, 255, 255, 0.2);
      }

      &:focus {
        border-color: #00ff9d;
        box-shadow: 0 0 0 2px rgba(0, 255, 157, 0.2);
      }
    }
  }

  .gangs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;

    .gang-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .gang-card-header {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        .logo-wrapper {
          position: relative;
          
          .gang-logo {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.1);
          }

          .status-indicator {
            position: absolute;
            bottom: -4px;
            right: -4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid rgba(13, 17, 23, 0.95);
          }
        }

        .gang-info {
          flex: 1;
          
          h3 {
            margin: 0 0 0.75rem 0;
            font-size: 1.4rem;
            color: #fff;
            font-weight: 600;
          }

          .gang-tag {
            padding: 0.4rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
          }
        }
      }

      .gang-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        .stat-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-2px);
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            margin: 0 auto 0.75rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;

            &.power-icon {
              background: rgba(0, 255, 157, 0.1);
              color: #00ff9d;
            }

            &.territories-icon {
              background: rgba(0, 183, 255, 0.1);
              color: #00b7ff;
            }

            &.members-icon {
              background: rgba(255, 64, 129, 0.1);
              color: #ff4081;
            }
          }

          .stat-info {
            .stat-label {
              display: block;
              font-size: 0.8rem;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 0.25rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .stat-value {
              font-size: 1.2rem;
              font-weight: 600;
              color: #fff;
            }
          }
        }
      }
    }
  }
}

:deep(.p-dropdown) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .p-dropdown-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .p-dropdown-trigger {
    color: rgba(255, 255, 255, 0.7);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    border-color: #00ff9d;
    box-shadow: 0 0 0 2px rgba(0, 255, 157, 0.2);
  }
}

:deep(.p-dropdown-panel) {
  background: rgba(13, 17, 23, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);

  .p-dropdown-items {
    padding: 0.5rem;

    .p-dropdown-item {
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      margin: 0.25rem 0;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &.p-highlight {
        background: rgba(0, 255, 157, 0.2);
        color: #00ff9d;
      }
    }
  }
}
</style>