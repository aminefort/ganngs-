<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useGlobalState } from "../stores/globalStore";
import { fetchNui } from "../utils";
import locale from "../locale";

const globalState = useGlobalState();

onMounted(async () => {
  await fetchGangData();
});

const confirm = useConfirm();
const toast = useToast();

const newMemberVisible = ref(false);
const newMemberID = ref(0);

const rankManagementVisible = ref(false);
const editingRanks = ref([]);
const rankContextMenu = ref();
const selectedContextRank = ref();
const rankMenuModel = ref([
  {
    label: await locale("YourGang", "move_up"),
    icon: "pi pi-chevron-circle-up",
    command: () => increaseRankOrder(selectedContextRank),
  },
  {
    label: await locale("YourGang", "move_down"),
    icon: "pi pi-chevron-circle-down",
    command: () => decreaseRankOrder(selectedContextRank),
  },
  {
    label: await locale("YourGang", "delete"),
    icon: "pi pi-fw pi-times",
    command: () => deleteRank(selectedContextRank),
  },
]);

const fetchGangData = async () => {
  const myGang = await fetchNui("getMyGang");
  if (myGang) {
    globalState.myGang.value = myGang;
    globalState.myGang.value.members.forEach((member) => {
      member.menuRef = undefined;
    });
  } else {
    globalState.myGang.value = null;
  }
};

// ... [Previous functions remain unchanged]

</script>

<template>
  <div class="gang-container">
    <Toast />
    <ConfirmPopup></ConfirmPopup>
    
    <!-- Dialogs remain unchanged -->

    <div v-if="!globalState.myGang.value" class="not-in-gang">
      <div class="empty-state">
        <i class="pi pi-users"></i>
        <h3>{{ locale("YourGang", "not_in_gang") }}</h3>
        <Button
          v-if="globalState.canCreateGangSetting.value"
          :label="locale('YourGang', 'create_gang_button_new')"
          icon="pi pi-plus-circle"
          @click="creatingGang = true"
          class="create-gang-btn"
        />
      </div>
    </div>

    <div class="gang-content" v-else>
      <div class="gang-header">
        <div class="gang-identity">
          <Avatar :image="globalState.myGang.value.logo" size="xlarge" class="gang-avatar" />
          <div class="gang-info">
            <h2>{{ globalState.myGang.value.name }}</h2>
            <Tag
              :value="globalState.myGang.value.shortName"
              :style="{ background: `#${globalState.myGang.value.color}20`, color: `#${globalState.myGang.value.color}` }"
              class="gang-tag"
            />
          </div>
          <Button 
            icon="pi pi-pencil" 
            text 
            @click="openEditingGang" 
            class="edit-btn"
          />
        </div>
        
        <div class="gang-stats">
          <Tag
            :value="`${locale('YourGang', 'leader')}: ${globalState.myGang.value.leader}`"
            icon="pi pi-user"
            severity="info"
            class="stat-tag"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'power')"
            :value="globalState.myGang.value.power.toString()"
            icon="pi pi-chevron-up"
            severity="info"
            class="stat-tag"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'territories')"
            :value="globalState.myGang.value.territories.length.toString()"
            icon="pi pi-flag-fill"
            severity="success"
            class="stat-tag"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'coins')"
            :value="globalState.myGang.value.coins.toString()"
            icon="pi pi-wallet"
            severity="warning"
            class="stat-tag"
          />
        </div>
      </div>

      <div class="content-grid">
        <div class="section members-section">
          <div class="section-header">
            <h3>
              <i class="pi pi-users"></i>
              {{ locale("YourGang", "members") }}
            </h3>
            <div class="section-actions">
              <Button
                icon="pi pi-user-plus"
                rounded
                text
                v-if="globalState.myGang.value.ranks[globalState.myUser.value.rank]?.permissions.manageMembers"
                @click="newMemberVisible = true"
                class="action-btn"
              />
              <Button
                icon="pi pi-sitemap"
                rounded
                text
                v-if="globalState.myGang.value.ranks[globalState.myUser.value.rank]?.permissions.manageGang"
                @click="rankManagementVisible = true"
                class="action-btn"
              />
            </div>
          </div>
          
          <DataTable 
            :value="globalState.myGang.value.members" 
            class="members-table"
            :scrollable="true"
            scrollHeight="400px"
          >
            <!-- Table columns remain unchanged -->
          </DataTable>
        </div>

        <div class="section stats-section">
          <div class="section-header">
            <h3>
              <i class="pi pi-chart-bar"></i>
              {{ locale("YourGang", "statistics") }}
            </h3>
          </div>
          
          <div class="stats-grid">
            <!-- Stats cards remain unchanged -->
          </div>
        </div>
      </div>

      <div class="gang-footer">
        <Button
          :label="locale('YourGang', 'leave_gang')"
          severity="danger"
          outlined
          @click="confirmLeaveGang($event)"
          class="leave-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gang-container {
  height: 100%;
  color: white;
  background: #0d0d0d;

  .not-in-gang {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-state {
      text-align: center;
      
      i {
        font-size: 3rem;
        color: rgba(255, 255, 255, 0.2);
        margin-bottom: 1rem;
      }

      h3 {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 1.5rem;
      }

      .create-gang-btn {
        background: #00ff9d;
        border: none;
        
        &:hover {
          background: darken(#00ff9d, 10%);
        }
      }
    }
  }

  .gang-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);

    .gang-header {
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .gang-identity {
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .gang-avatar {
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .gang-info {
          h2 {
            margin: 0;
            font-size: 1.8rem;
            color: #fff;
            font-weight: 600;
          }

          .gang-tag {
            margin-top: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 6px;
          }
        }

        .edit-btn {
          color: rgba(255, 255, 255, 0.7);
          
          &:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }

      .gang-stats {
        display: flex;
        gap: 0.75rem;

        .stat-tag {
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }
      }
    }

    .content-grid {
      flex: 1;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      overflow-y: auto;

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

      .section {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);

        .section-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;

          h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #fff;
            font-size: 1.2rem;

            i {
              color: #00ff9d;
            }
          }

          .section-actions {
            display: flex;
            gap: 0.5rem;

            .action-btn {
              color: rgba(255, 255, 255, 0.7);
              
              &:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }
      }

      .members-section {
        .members-table {
          background: transparent;

          :deep(.p-datatable-wrapper) {
            border-radius: 0 0 12px 12px;
            overflow: hidden;
          }

          :deep(.p-datatable-header) {
            background: transparent;
            border: none;
          }

          :deep(.p-datatable-thead > tr > th) {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
            padding: 1rem 1.5rem;
          }

          :deep(.p-datatable-tbody > tr) {
            background: transparent;
            transition: background-color 0.3s ease;
            
            &:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            > td {
              border-color: rgba(255, 255, 255, 0.1);
              padding: 1rem 1.5rem;
            }
          }
        }
      }

      .stats-section {
        .stats-grid {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;

          .stat-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1.25rem;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 255, 255, 0.05);
              transform: translateY(-2px);
            }

            h4 {
              margin: 0 0 1rem 0;
              color: rgba(255, 255, 255, 0.7);
              font-size: 0.9rem;
              font-weight: 500;
            }
          }
        }
      }
    }

    .gang-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: center;

      .leave-btn {
        padding: 0.75rem 2rem;
        font-weight: 500;
        
        &:hover {
          background: rgba(220, 53, 69, 0.1);
        }
      }
    }
  }
}

// Dialog Styles
:deep(.p-dialog) {
  backdrop-filter: blur(10px);
  background: rgba(13, 17, 23, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;

  .p-dialog-header {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
  }

  .p-dialog-content {
    background: transparent;
    padding: 1.5rem;
  }
}

// Toast Styles
:deep(.p-toast) {
  .p-toast-message {
    backdrop-filter: blur(10px);
    background: rgba(13, 17, 23, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
}
</style>