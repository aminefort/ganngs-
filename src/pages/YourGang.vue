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

const increaseRankOrder = async (args) => {
  if (!args.value.id) return;

  const data = await fetchNui("increaseRankOrder", args.value.id);
  if (!data) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
    return;
  }

  globalState.myGang.value = data;
};

const decreaseRankOrder = async (args) => {
  if (!args.value.id) return;

  const data = await fetchNui("decreaseRankOrder", args.value.id);
  if (!data) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
    return;
  }

  globalState.myGang.value = data;
};

const onRankContextMenu = (event) => {
  if (selectedContextRank.value.id == 0 || selectedContextRank.value.id == 1) {
    selectedContextRank.value = undefined;
    return;
  }
  rankContextMenu.value.show(event.originalEvent);
};

const onRankEditSave = async (event) => {
  let { newData } = event;

  const data = await fetchNui("editGangRank", {
    id: newData.id,
    data: newData,
  });

  if (data) {
    toast.add({
      severity: "success",
      summary: locale("YourGang", "edit_success"),
      detail: locale("YourGang", "rank_update_success"),
      life: 3000,
    });
    globalState.myGang.value = data;
  } else {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
  }
};

const editingGang = ref(false);
const editGangTemp = ref(undefined);

const openEditingGang = () => {
  editGangTemp.value = {
    name: globalState.myGang.value.name,
    shortName: globalState.myGang.value.shortName,
    color: globalState.myGang.value.color,
    logo: globalState.myGang.value.logo,
  };

  editGangTemp.value.leader = globalState.myGang.value.members.find(
    (m) => m.name == globalState.myGang.value.leader
  ).identifier;

  editingGang.value = true;
};

const saveEditingGang = async () => {
  if (
    !editGangTemp.value.name ||
    !editGangTemp.value.shortName ||
    !editGangTemp.value.color ||
    !editGangTemp.value.logo ||
    !editGangTemp.value.leader
  ) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "not_all_required_fields"),
      life: 3000,
    });
    return;
  }

  const data = await fetchNui("editGang", editGangTemp.value, true);

  if (data) {
    toast.add({
      severity: "success",
      summary: locale("YourGang", "edit_success"),
      detail: locale("YourGang", "gang_update_success"),
      life: 3000,
    });
    globalState.myGang.value = data;
    editingGang.value = false;
  } else {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
  }
};

const creatingGang = ref(false);
const creatingGangTemp = reactive({
  name: "",
  shortName: "",
  color: undefined,
  logo: "",
});

const toggleUserMenu = (index, event) => {
  globalState.myGang.value.members[index].menuRef.toggle(event);
};

const confirmLeaveGang = (event) => {
  confirm.require({
    target: event.currentTarget,
    message: locale("YourGang", "are_you_sure"),
    icon: "pi pi-exclamation-circle",
    rejectClass: "p-button-secondary p-button-outlined p-button-sm",
    acceptClass: "p-button-sm p-button-danger",
    rejectLabel: locale("YourGang", "cancel"),
    acceptLabel: locale("YourGang", "yes"),
    accept: async () => {
      const response = await fetchNui("leaveGang");

      if (response) {
        fetchGangData();
        toast.add({
          severity: "success",
          summary: locale("YourGang", "left_gang"),
          detail: locale("YourGang", "left_gang_description"),
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: locale("YourGang", "something_went_wrong"),
          detail: locale("YourGang", "couldnt_leave_gang"),
          life: 3000,
        });
      }
    },
  });
};

const createGang = async () => {
  if (
    !creatingGangTemp.color ||
    !creatingGangTemp.logo ||
    !creatingGangTemp.name ||
    !creatingGangTemp.shortName
  ) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "not_all_required_fields"),
      life: 3000,
    });
    return;
  }
  creatingGang.value = false;
  const data = await fetchNui("createGang", creatingGangTemp);
  if (!data) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
    return;
  }

  globalState.myGang.value = data;
};

const createNewRank = async () => {
  const data = await fetchNui("createNewRank");
  if (!data) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
    return;
  }

  globalState.myGang.value = data;
};

const deleteRank = async (args) => {
  const data = await fetchNui("deleteRank", args.value.id);
  if (!data) {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "something_went_wrong"),
      detail: locale("YourGang", "please_try_again"),
      life: 3000,
    });
    return;
  }

  globalState.myGang.value = data;
};

const removeMember = async (event) => {
  const identifier = event.item.identifier;
  if (!identifier) return;

  const response = await fetchNui("kickGangMember", identifier);

  if (response) {
    toast.add({
      severity: "success",
      summary: locale("YourGang", "success"),
      detail: locale("YourGang", "player_kicked"),
      life: 3000,
    });

    globalState.myGang.value = null;
    fetchGangData();
  } else {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "failed"),
      detail: locale("YourGang", "something_went_wrong"),
      life: 3000,
    });
  }

  newMemberVisible.value = false;
};

const changeRank = async (event) => {
  const { identifier, rankId } = event.item;

  if (!identifier || !rankId) return;

  const response = await fetchNui("changeMemberRank", {
    identifier: identifier,
    rankId: rankId,
  });

  if (response) {
    toast.add({
      severity: "success",
      summary: locale("YourGang", "success"),
      detail: locale("YourGang", "player_rank_updated"),
      life: 3000,
    });

    fetchGangData();
  } else {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "failed"),
      detail: locale("YourGang", "something_went_wrong"),
      life: 3000,
    });
  }
};

const getAvailableRanks = (identifier) => {
  if (!globalState.myGang.value.ranks) return [];
  const ranks = [];

  Object.values(globalState.myGang.value.ranks).forEach((rank) => {
    if (rank.id == 0) return;

    ranks.push({
      label: rank.name,
      command: changeRank,
      rankId: rank.id,
      identifier: identifier,
    });
  });

  return ranks;
};

const inviteNewMember = async () => {
  if (newMemberID.value < 1) return;

  const response = await fetchNui("inviteNewMember", newMemberID.value);

  if (response) {
    toast.add({
      severity: "success",
      summary: locale("YourGang", "success"),
      detail: locale("YourGang", "player_invite_accepted"),
      life: 3000,
    });

    fetchGangData();
  } else {
    toast.add({
      severity: "error",
      summary: locale("YourGang", "failed"),
      detail: locale("YourGang", "player_invite_denied"),
      life: 3000,
    });
  }

  newMemberVisible.value = false;
};

const sortGangRanks = (ranks) => {
  return Object.values(ranks).sort((a, b) => b.order - a.order);
};
</script>

<template>
  <div class="Main">
    <Toast />
    <ConfirmPopup></ConfirmPopup>
    <Dialog
      v-model:visible="creatingGang"
      modal
      :header="locale('YourGang', 'create_gang_header')"
      :style="{ width: '15vw', minWidth: '500px' }"
    >
      <div style="display: flex; flex-direction: column">
        <label for="gangName">{{
          locale("YourGang", "create_gang_name")
        }}</label>
        <InputText
          id="gangName"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="creatingGangTemp.name"
        />
        <label for="gangShortName">{{
          locale("YourGang", "create_gang_short_name")
        }}</label>
        <InputText
          id="gangShortName"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="creatingGangTemp.shortName"
        />
        <label for="gangLogo">{{
          locale("YourGang", "create_gang_logo")
        }}</label>
        <InputText
          id="gangLogo"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="creatingGangTemp.logo"
        />
        <label for="gc-hex">{{
          locale("YourGang", "create_gang_color")
        }}</label>
        <ColorPicker
          v-model="creatingGangTemp.color"
          inputId="gc-hex"
          format="hex"
          style="margin: 1vh 0"
        />
        <div style="margin-top: 1vh">
          <Button
            type="button"
            :label="locale('YourGang', 'create_gang_button')"
            @click="createGang"
          ></Button>
        </div>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="newMemberVisible"
      modal
      :header="locale('YourGang', 'new_member_header')"
      :style="{ width: '15vw', minWidth: '300px' }"
    >
      <div style="display: flex; flex-direction: column">
        <label for="username">{{
          locale("YourGang", "new_member_player_id")
        }}</label>
        <InputNumber
          id="username"
          style="margin-top: 1vh"
          autocomplete="off"
          v-model="newMemberID"
        />
        <div style="margin-top: 1vh">
          <Button
            type="button"
            :label="locale('YourGang', 'new_member_button')"
            @click="inviteNewMember"
          ></Button>
        </div>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="editingGang"
      modal
      :header="locale('YourGang', 'edit_gang_header')"
      :style="{ width: '15vw', minWidth: '500px' }"
    >
      <div style="display: flex; flex-direction: column">
        <label for="gangName">{{
          locale("YourGang", "create_gang_name")
        }}</label>
        <InputText
          id="gangName"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="editGangTemp.name"
        />
        <label for="gangShortName">{{
          locale("YourGang", "create_gang_short_name")
        }}</label>
        <InputText
          id="gangShortName"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="editGangTemp.shortName"
        />
        <label for="gangLogo">{{
          locale("YourGang", "create_gang_logo")
        }}</label>
        <InputText
          id="gangLogo"
          style="margin: 1vh 0"
          autocomplete="off"
          v-model="editGangTemp.logo"
        />
        <label for="leader">{{ locale("YourGang", "edit_gang_leader") }}</label>

        <Dropdown
          id="leader"
          :options="globalState.myGang.value.members"
          optionLabel="name"
          optionValue="identifier"
          placeholder="Gang Leader"
          style="margin: 1vh 0"
          v-model="editGangTemp.leader"
        />
        <label for="gc-hex">{{
          locale("YourGang", "create_gang_color")
        }}</label>
        <ColorPicker
          v-model="editGangTemp.color"
          inputId="gc-hex"
          format="hex"
          style="margin: 1vh 0"
        />
        <div style="margin-top: 1vh">
          <Button
            type="button"
            :label="locale('YourGang', 'edit_gang_button')"
            @click="saveEditingGang"
          ></Button>
        </div>
      </div>
    </Dialog>
    <Dialog
      v-model:visible="rankManagementVisible"
      modal
      :header="locale('YourGang', 'manage_ranks_header')"
      :style="{ width: '40vw', minWidth: '1000px' }"
    >
      <ContextMenu
        ref="rankContextMenu"
        :model="rankMenuModel"
        @hide="selectedProduct = null"
      />
      <DataTable
        :value="sortGangRanks(globalState.myGang.value.ranks)"
        editMode="row"
        dataKey="id"
        v-model:editingRows="editingRanks"
        @row-edit-save="onRankEditSave"
        contextMenu
        v-model:contextMenuSelection="selectedContextRank"
        @rowContextmenu="onRankContextMenu"
      >
        <template #header>
          <div style="display: flex; justify-content: flex-end">
            <Button
              text
              icon="pi pi-plus"
              :label="locale('YourGang', 'manage_ranks_new_button')"
              @click="createNewRank"
            />
          </div>
        </template>
        <Column
          field="name"
          :header="locale('YourGang', 'manage_ranks_column_rank')"
        >
          <template #body="slotProps">
            <Tag :value="slotProps.data.name" />
          </template>
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column
          field="permissions"
          :header="locale('YourGang', 'manage_ranks_column_permissions')"
        >
          <template #body="slotProps">
            <div style="display: flex; gap: 0.2vw">
              <Tag
                icon="pi pi-wrench"
                :severity="
                  slotProps.data.permissions.manageGang ? 'success' : 'danger'
                "
              />
              <Tag
                icon="pi pi-users"
                :severity="
                  slotProps.data.permissions.manageMembers
                    ? 'success'
                    : 'danger'
                "
              />
              <Tag
                icon="pi pi-box"
                :severity="
                  slotProps.data.permissions.openStash ? 'success' : 'danger'
                "
              />
              <Tag
                icon="pi pi-briefcase"
                :severity="
                  slotProps.data.permissions.dealers ? 'success' : 'danger'
                "
              />
            </div>
          </template>
          <template #editor="{ data, field }">
            <div style="display: flex; gap: 0.5vw">
              <div style="display: flex; gap: 0.2vw">
                <Checkbox
                  v-model="data.permissions.manageGang"
                  name="ranks"
                  value="manageGang"
                  :binary="true"
                />
                <Tag icon="pi pi-wrench" />
              </div>
              <div style="display: flex; gap: 0.2vw">
                <Checkbox
                  v-model="data.permissions.manageMembers"
                  name="ranks"
                  value="manageMembers"
                  :binary="true"
                />
                <Tag icon="pi pi-users" />
              </div>
              <div style="display: flex; gap: 0.2vw">
                <Checkbox
                  v-model="data.permissions.openStash"
                  name="ranks"
                  value="openStash"
                  :binary="true"
                />
                <Tag icon="pi pi-box" />
              </div>
              <div style="display: flex; gap: 0.2vw">
                <Checkbox
                  v-model="data.permissions.dealers"
                  name="ranks"
                  value="dealers"
                  :binary="true"
                />
                <Tag icon="pi pi-briefcase" />
              </div>
            </div>
          </template>
        </Column>
        <Column :rowEditor="true" bodyStyle="text-align:center"></Column>
      </DataTable>
    </Dialog>
    <div v-if="!globalState.myGang.value" class="NotInGang">
      <div>{{ locale("YourGang", "not_in_gang") }}</div>
      <Button
        v-if="globalState.canCreateGangSetting.value"
        :label="locale('YourGang', 'create_gang_button_new')"
        icon="pi pi-plus-circle"
        @click="creatingGang = true"
      />
    </div>
    <div class="GangInfo" v-else>
      <div class="gang-header">
        <div class="gang-identity">
          <Avatar :image="globalState.myGang.value.logo" size="xlarge" />
          <div class="gang-name">
            <h2>{{ globalState.myGang.value.name }}</h2>
            <Tag
              :value="globalState.myGang.value.shortName"
              :style="{ background: `#${globalState.myGang.value.color}` }"
            />
          </div>
          <Button icon="pi pi-pencil" text @click="openEditingGang" />
        </div>
        <div class="gang-stats">
          <Tag
            :value="`${locale('YourGang', 'leader')}: ${
              globalState.myGang.value.leader
            }`"
            icon="pi pi-user"
            severity="info"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'power')"
            :value="globalState.myGang.value.power.toString()"
            icon="pi pi-chevron-up"
            severity="info"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'territories')"
            :value="globalState.myGang.value.territories.length.toString()"
            icon="pi pi-flag-fill"
            severity="success"
          />
          <Tag
            v-tooltip.top="locale('YourGang', 'coins')"
            :value="globalState.myGang.value.coins.toString()"
            icon="pi pi-wallet"
            severity="warning"
          />
        </div>
      </div>

      <div class="content-grid">
        <!-- Members Section -->
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
                v-if="
                  globalState.myGang.value.ranks[globalState.myUser.value.rank]
                    ?.permissions.manageMembers
                "
                @click="newMemberVisible = true"
              />
              <Button
                icon="pi pi-sitemap"
                rounded
                text
                v-if="
                  globalState.myGang.value.ranks[globalState.myUser.value.rank]
                    ?.permissions.manageGang
                "
                @click="rankManagementVisible = true"
              />
            </div>
          </div>
          <DataTable :value="globalState.myGang.value.members" class="p-datatable-sm">
            <Column
              field="name"
              :header="locale('YourGang', 'members_column_name')"
            ></Column>
            <Column field="rank" :header="locale('YourGang', 'members_column_rank')">
              <template #body="slotProps">
                <Tag
                  :value="globalState.myGang.value.ranks[slotProps.data.rank].name"
                />
              </template>
            </Column>
            <Column
              field="online"
              :header="locale('YourGang', 'members_column_online')"
            >
              <template #body="slotProps">
                <Tag
                  icon="pi pi-check"
                  severity="success"
                  v-if="typeof(slotProps.data.online) == 'boolean'"
                />
                <Tag severity="danger" v-else :value="slotProps.data.online" />
              </template>
            </Column>
            <Column
              field="actions"
              :header="locale('YourGang', 'members_column_actions')"
            >
              <template #body="slotProps">
                <Button
                  icon="pi pi-user-edit"
                  rounded
                  text
                  @click="toggleUserMenu(slotProps.index, $event)"
                  aria-haspopup="true"
                  :id="`overlay_menu_${slotProps.index}`"
                  v-if="slotProps.data.rank != 0 && slotProps.data.identifier != globalState.myUser.value.identifier"
                ></Button>
                <Menu
                  :ref="
                    (el) => {
                      if (!globalState.myGang.value) return;
                      globalState.myGang.value.members[
                        slotProps.index
                      ].menuRef = el;
                    }
                  "
                  :id="`overlay_menu_${slotProps.index}`"
                  :model="[
                    {
                      label: locale('YourGang', 'members_action_remove'),
                      icon: 'pi pi-user-minus',
                      command: removeMember,
                      identifier: slotProps.data.identifier,
                    },
                    {
                      label: locale('YourGang', 'members_action_rank'),
                      icon: 'pi pi-sitemap',
                      items: getAvailableRanks(slotProps.data.identifier),
                    },
                  ]"
                  :popup="true"
                />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Statistics Section -->
        <div class="section stats-section">
          <div class="section-header">
            <h3>
              <i class="pi pi-chart-bar"></i>
              {{ locale("YourGang", "statistics") }}
            </h3>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_current_power") }}</h4>
              <Tag
                severity="info"
                icon="pi pi-chevron-up"
                :value="globalState.myGang.value.power.toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_highest_power") }}</h4>
              <Tag
                severity="warning"
                icon="pi pi-chevron-up"
                :value="globalState.myGang.value.stats['highest_power'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_contracts_completed") }}</h4>
              <Tag
                severity="success"
                icon="pi pi-tablet"
                :value="globalState.myGang.value.stats['contracts_completed'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_contracts_failed") }}</h4>
              <Tag
                severity="danger"
                icon="pi pi-tablet"
                :value="globalState.myGang.value.stats['contracts_failed'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_currency_earned") }}</h4>
              <Tag
                severity="success"
                icon="pi pi-wallet"
                :value="globalState.myGang.value.stats['currency_earned'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "stats_currency_spent") }}</h4>
              <Tag
                severity="danger"
                icon="pi pi-wallet"
                :value="globalState.myGang.value.stats['currency_spent'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "status_graffiti_sprayed") }}</h4>
              <Tag
                severity="success"
                icon="pi pi-circle-fill"
                :value="globalState.myGang.value.stats['graffiti_sprayed'].toString()"
              />
            </div>
            <div class="stat-card">
              <h4>{{ locale("YourGang", "status_graffiti_cleaned") }}</h4>
              <Tag
                severity="danger"
                icon="pi pi-circle-fill"
                :value="globalState.myGang.value.stats['graffiti_cleaned'].toString()"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="gang-footer">
        <Button
          :label="locale('YourGang', 'leave_gang')"
          severity="danger"
          outlined
          @click="confirmLeaveGang($event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Main {
  width: 100%;
  color: white;
  padding: 2rem;
  
  .NotInGang {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1vh;
    margin-bottom: 3vh;
  }

  .GangInfo {
    // background: rgba(255, 255, 255 , 0.05);
    border-radius: 1rem;
    padding: 2rem;
    backdrop-filter: blur(10px);

    .gang-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .gang-identity {
        display: flex;
        align-items: center;
        gap: 1rem;

        .gang-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          h2 {
            margin: 0;
            color: white;
          }
        }
      }

      .gang-stats {
        display: flex;
        gap: 0.5rem;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 2rem;

      .section {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.5rem;
        padding: 1.5rem;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: white;

            i {
              font-size: 1.2rem;
            }
          }

          .section-actions {
            display: flex;
            gap: 0.5rem;
          }
        }
      }

      .members-section {
        .p-datatable {
          background: transparent;

          .p-datatable-header {
            background: transparent;
            border: none;
          }

          .p-datatable-thead > tr > th {
            background: transparent;
            border-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
          }

          .p-datatable-tbody > tr {
            background: transparent;
            
            &:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            > td {
              border-color: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }

      .stats-section {
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;

          .stat-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0.5rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            h4 {
              margin: 0;
              color: rgba(255, 255, 255, 0.7);
              font-size: 0.9rem;
            }
          }
        }
      }
    }

    .gang-footer {
      display: flex;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>