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
})

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
  <div class="Main">
    <div class="Header">
      <div class="HeaderContent">
        <h1>Gangs Overview</h1>
        <p class="SubTitle">all active gangs in the territory</p>
      </div>
      <Dropdown 
        v-model="currentSortKey" 
        :options="sortOptions" 
        optionLabel="label" 
        placeholder="Sort by" 
        class="SortDropdown"
        @change="onSortChange($event)"
      />
    </div>

    <DataView :value="gangs" :sortField="currentSort" :sortOrder="-1">
      <template #list="slotProps">
        <div class="DataGrid">
          <div v-for="(item, index) in slotProps.items" :key="index" class="GangCard">
            <div class="GangHeader">
              <div class="GangLogoWrapper">
                <Avatar
                  :image="item.logo"
                  size="large"
                  class="GangLogo"
                />
                <div class="GangStatus" :style="{ background: `#${item.color}` }"></div>
              </div>
              <div class="GangInfo">
                <h2>{{ item.name }}</h2>
                <Tag 
                  :value="item.shortName" 
                  class="GangTag"
                  :style="{
                    background: `#${item.color}20`,
                    color: `#${item.color}`,
                    border: `1px solid #${item.color}40`
                  }"
                />
              </div>
            </div>

            <div class="GangStats">
              <div class="StatItem">
                <div class="StatIcon PowerIcon">
                  <i class="pi pi-bolt"></i>
                </div>
                <div class="StatInfo">
                  <span class="StatLabel">Power Level</span>
                  <span class="StatValue">{{ item.power }}</span>
                </div>
              </div>

              <div class="StatItem">
                <div class="StatIcon TerritoriesIcon">
                  <i class="pi pi-map"></i>
                </div>
                <div class="StatInfo">
                  <span class="StatLabel">Territories</span>
                  <span class="StatValue">{{ item.territories.length }}</span>
                </div>
              </div>

              <div class="StatItem" v-if="globalState.canSeeMemberCount.value">
                <div class="StatIcon MembersIcon">
                  <i class="pi pi-users"></i>
                </div>
                <div class="StatInfo">
                  <span class="StatLabel">Members</span>
                  <span class="StatValue">{{ item.members.length }}</span>
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
.Main {
  width: 100%;
  min-height: 100vh;
  // background: linear-gradient(145deg, rgba(0, 119, 167, 0.15), rgba(0, 255, 157, 0.05));
  color: white;
  padding: 2rem;
  overflow-x: hidden;
  // backdrop-filter: blur(2px);

  .Header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: radial-gradient(75.44% 82.2% at 50% 50%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.00) 100%);
    border-radius: 16px;
    // backdrop-filter: blur(4px);
    // box-shadow: 0 0 20px rgba(0, 183, 255, 0.1);
    border: 1px solid rgba(0, 183, 255, 0.1);

    .HeaderContent {
      h1 {
        font-size: 2.25rem;
        margin: 0;
        color: #00b7ff;
        text-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
        font-weight: 700;
        letter-spacing: -0.5px;
      }

      .SubTitle {
        margin: 0.5rem 0 0 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        letter-spacing: 0.5px;
      }
    }

    .SortDropdown {
      width: 180px;
      background: rgba(0, 183, 255, 0.1);
      border: 1px solid rgba(0, 183, 255, 0.2);
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0, 183, 255, 0.1);
      color: white;
      padding: 0.75rem 1rem;
      outline: none;
      cursor: pointer;
      // backdrop-filter: blur(4px);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(0, 183, 255, 0.4);
      }

      &:focus {
        border-color: #00b7ff;
        box-shadow: 0 0 20px rgba(0, 183, 255, 0.3);
      }

      option {
        background: #0a1a2a;
        color: white;
        padding: 10px;
      }
    }
  }

  .DataGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
    width: 100%;

    @media (min-width: 640px) {
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 2rem;
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2.5rem;
    }

    .GangCard {
      border: 1px solid rgba(255, 255, 255, 0.15);
    background: radial-gradient(75.44% 82.2% at 50% 50%, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.00) 100%);

      border-radius: 16px;
      // border: 1px solid rgba(0, 183, 255, 0.15);
      padding: 1.5rem;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      // backdrop-filter: blur(4px);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        // background: rgba(255, 255, 255, 0.03);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        border-color: rgba(51, 51, 51, 0.3);

        &::before {
          opacity: 1;
        }
      }

      .GangHeader {
        display: flex;
        gap: 1.5rem;
        align-items: center;

        .GangLogoWrapper {
          position: relative;
          flex-shrink: 0;
          
          .GangLogo {
            width: 72px;
            height: 72px;
            border-radius: 14px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            object-fit: cover;
            border: 2px solid rgba(0, 132, 255, 0.2);
          }

          .GangStatus {
            position: absolute;
            bottom: -4px;
            right: -4px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid rgba(8, 20, 30, 0.9);
            box-shadow: 0 0 10px rgba(0, 183, 255, 0.3);
          }
        }

        .GangInfo {
          flex: 1;
          min-width: 0;
          
          h2 {
            margin: 0 0 0.75rem 0;
            font-size: 1.5rem;
            color: #00b7ff;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
          }

          .GangTag {
            font-size: 0.875rem;
            padding: 0.25rem 1rem;
            border-radius: 8px;
            font-weight: 500;
            display: inline-block;
            letter-spacing: 0.5px;
            // backdrop-filter: blur(4px);
          }
        }
      }

      .GangStats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        .StatItem {
          background: rgba(0, 183, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          border: 1px solid rgba(0, 183, 255, 0.1);

          &:hover {
            background: rgba(0, 183, 255, 0.1);
            transform: translateY(-2px);
            border-color: rgba(0, 183, 255, 0.2);
          }

          .StatIcon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            svg {
              transition: all 0.3s ease;
            }

            &.PowerIcon {
              background: rgba(0, 183, 255, 0.1);
              color: #00b7ff;
            }

            &.TerritoriesIcon {
              background: rgba(0, 255, 157, 0.1);
              color: #00ffa1;
            }

            &.MembersIcon {
              background: rgba(0, 119, 167, 0.1);
              color: #0077a7;
            }
          }

          .StatInfo {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;

            .StatLabel {
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.6);
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .StatValue {
              font-size: 1.25rem;
              font-weight: 600;
              color: #00b7ff;
              text-shadow: 0 0 10px rgba(0, 195, 255, 0.3);
            }
          }
        }
      }
    }
  }
}

</style>