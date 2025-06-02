<script setup>
import { ref, onMounted, computed } from "vue";
import { fetchNui } from "../utils";
import { useGlobalState } from "../stores/globalStore";

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import locale from "../locale";

const globalState = useGlobalState();
const currentDealer = ref(null);
const dealers = ref([]);
const contracts = ref([]);

const confirm = useConfirm();
const toast = useToast();

const currentCart = ref([]);
const cartModal = ref(false);
const waitingCartResponse = ref(false);

const contractModal = ref(false);

const currentTask = ref(null);

onMounted(async () => {
  fetchDealerData();
  fetchContracts();
});

const fetchDealerData = async () => {
  const dealerData = await fetchNui("getDealers");
  if (dealerData) {
    dealers.value = dealerData;
  }
};

const fetchContracts = async () => {
  const contractData = await fetchNui("getContracts");
  if (contractData) {
    contracts.value = contractData;
  }
};

const fetchGangData = async () => {
  const myGang = await fetchNui("getMyGang");
  if (myGang) {
    globalState.myGang.value = myGang;

    globalState.myGang.value.members.forEach((member) => {
      member.menuRef = undefined;
    });
  }
};

const selectedDealer = computed(() => {
  return dealers.value.find((d) => d.id == currentDealer.value);
});

const openDealer = (dealer) => {
  currentDealer.value = dealer;
  currentCart.value = [];
};

const upgrade = (id, event) => {
  confirm.require({
    target: event.currentTarget,
    message: locale("DarkWeb", "are_you_sure"),
    icon: "pi pi-exclamation-triangle",
    rejectClass: "p-button-secondary p-button-outlined p-button-sm",
    acceptClass: "p-button-sm",
    rejectLabel: locale("DarkWeb", "cancel"),
    acceptLabel: locale("DarkWeb", "yes"),
    accept: async () => {
      const result = await fetchNui("dealerUpgrade", {
        upgrade: id,
        dealer: selectedDealer.value.id,
      });

      if (result) {
        fetchDealerData();
        fetchGangData();
        toast.add({
          severity: "success",
          summary: locale("DarkWeb", "upgraded"),
          detail: locale("DarkWeb", "upgrade_successful"),
          life: 3000,
        });
      } else {
        toast.add({
          severity: "error",
          summary: locale("DarkWeb", "something_went_wrong"),
          detail: locale("DarkWeb", "upgrade_failed"),
          life: 3000,
        });
      }
    },
  });
};

const addToCart = (item, amount) => {
  const isInCart = currentCart.value.findIndex((i) => item == i.item);
  if (isInCart >= 0) {
    currentCart.value[isInCart].amount += amount;
    currentCart.value[isInCart].totalPrice =
      currentCart.value[isInCart].price * currentCart.value[isInCart].amount;
  } else {
    const title = selectedDealer.value.shop.find((i) => i.item == item).title;
    const price = selectedDealer.value.shop.find((i) => i.item == item).price;
    currentCart.value.push({
      title: title,
      price: price,
      totalPrice: price * amount,
      item: item,
      amount: amount,
    });
  }

  toast.add({
    severity: "success",
    summary: locale("DarkWeb", "added_to_cart"),
    life: 3000,
  });
};

const removeFromCart = (item, amount) => {
  const index = currentCart.value.findIndex((i) => i.item == item);
  if (index >= 0) {
    currentCart.value[index].amount -= amount;
    currentCart.value[index].totalPrice =
      currentCart.value[index].price * currentCart.value[index].amount;

    if (currentCart.value[index].amount < 1) {
      currentCart.value.splice(index, 1);
    }
  }
};

const buyCart = async () => {
  if (waitingCartResponse.value) return;

  waitingCartResponse.value = true;

  const response = await fetchNui("buyFromDealer", {
    items: currentCart.value.map((i) => ({ item: i.item, amount: i.amount })),
    dealer: selectedDealer.value.id,
  });

  if (response.status) {
    toast.add({
      severity: "success",
      summary: locale("DarkWeb", "success"),
      detail: locale("DarkWeb", "drop_off_location"),
      life: 5000,
    });

    cartModal.value = false;
    currentCart.value = [];
  } else {
    if (response.reason == "dropoff") {
      toast.add({
        severity: "error",
        summary: locale("DarkWeb", "purchase_failed"),
        detail: locale("DarkWeb", "no_free_drop_off"),
        life: 5000,
      });
    } else if (response.reason == "money") {
      toast.add({
        severity: "error",
        summary: locale("DarkWeb", "purchase_failed"),
        detail: locale("DarkWeb", "not_enough_money"),
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: locale("DarkWeb", "purchase_failed"),
        detail: locale("DarkWeb", "something_went_wrong"),
        life: 5000,
      });
    }
  }
  fetchDealerData();
  fetchGangData();
  waitingCartResponse.value = false;
};

const openTask = async (task) => {
  if (task.item) {
    task.item = await fetchNui("getItemName", task.item);
  }
  currentTask.value = task;
};

const startTask = async () => {
  if (!currentTask.value) return;

  const response = await fetchNui("startTask", {
    taskID: currentTask.value.id,
    dealer: selectedDealer.value.id,
  });

  if (response) {
    currentTask.value.started = true;
    fetchDealerData();
  }
};

const giveTaskItems = async () => {
  if (!currentTask.value) return;

  const response = await fetchNui("giveTaskItems", {
    dealer: selectedDealer.value.id,
    taskID: currentTask.value.id,
  });

  if (response) {
    fetchDealerData();
    currentTask.value = null;
    toast.add({
      severity: "success",
      summary: locale("DarkWeb", "success"),
      detail: locale("DarkWeb", "task_items_success"),
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: locale("DarkWeb", "failed"),
      detail: locale("DarkWeb", "task_items_failed"),
      life: 5000,
    });
  }
};

const finishTask = async () => {
  if (!currentTask.value) return;

  const response = await fetchNui("finishTask", {
    dealer: selectedDealer.value.id,
    taskID: currentTask.value.id,
  });

  if (response) {
    fetchDealerData();
    fetchGangData();
    currentTask.value = null;
    toast.add({
      severity: "success",
      summary: locale("DarkWeb", "success"),
      detail: locale("DarkWeb", "task_finished"),
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: locale("DarkWeb", "failed"),
      detail: locale("DarkWeb", "something_went_wrong"),
      life: 5000,
    });
  }
};

const formatStartTime = (time) => {
  const leftTime = time * 1000 - Date.now();

  const seconds = Math.floor(leftTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  // Format the result
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  } else {
    return locale("DarkWeb", "contracts_starting");
  }
};

const filterContracts = (data) => {
  const joined = data.find((a) => a.joined);
  if (joined) return [joined];
  return data.filter((a) => a.starts * 1000 - Date.now() > 0);
};

const acceptContract = async (contract) => {
  const response = await fetchNui("joinContract", contract);

  if (!response.status) {
    if (response.reason) {
      toast.add({
        severity: "error",
        summary: locale("DarkWeb", "failed"),
        detail: locale("DarkWeb", response.reason),
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: locale("DarkWeb", "failed"),
        detail: locale("DarkWeb", "something_went_wrong"),
        life: 5000,
      });
    }
  } else {
    toast.add({
      severity: "success",
      summary: locale("DarkWeb", "success"),
      detail: locale("DarkWeb", "contract_join_success"),
      life: 5000,
    });

    contractModal.value = false;
    fetchContracts();
  }
};

const getTaskImage = (taskName) => {
  return `./tasks/${taskName}.webp`;
};
</script>

<template>
  <div class="Main">
    <Dialog
      v-model:visible="contractModal"
      modal
      :header="contractModal.title"
      :style="{ width: '25vw' }"
    >
      <p>{{ contractModal.description }}</p>
      <div
        class="ContractModalEntry"
        v-if="contractModal.reputation.length > 0"
      >
        <h4>{{ locale("DarkWeb", "contract_modal_required_rep") }}</h4>
        <div
          v-for="(rep, index) in contractModal.reputation"
          :key="index"
          style="display: flex; gap: 0.5vw; align-items: center"
        >
          <Avatar :image="`./dealers/${rep.dealer}.webp`" shape="circle" />
          <Tag
            :value="rep.requiredRep.toString()"
            :severity="rep.has ? 'success' : 'danger'"
            style="height: 80%"
            icon="pi pi-circle-fill"
          />
        </div>
      </div>
      <div class="ContractModalEntry" v-if="contractModal.tasks.length > 0">
        <h4>{{ locale("DarkWeb", "contract_modal_required_tasks") }}</h4>
        <div
          v-for="(rep, index) in contractModal.tasks"
          :key="index"
          style="display: flex; gap: 0.5vw; align-items: center"
        >
          <Avatar :image="`./dealers/${rep.dealer}.webp`" shape="circle" />
          <Tag
            :value="rep.taskTitle"
            :severity="rep.completed ? 'success' : 'danger'"
            style="height: 80%"
          />
        </div>
      </div>
      <div
        style="display: flex; align-items: center; gap: 0.5vw; margin-top: 2vh"
        v-if="!contractModal.joined"
      >
        <Button
          type="button"
          :label="locale('DarkWeb', 'contract_modal_join')"
          @click="acceptContract(contractModal.id)"
        />
        <Tag
          severity="warning"
          :value="contractModal.price"
          icon="pi pi-wallet"
        />
      </div>
      <div
        style="display: flex; align-items: center; gap: 0.5vw; margin-top: 2vh"
        v-else
      >
        <Tag
          :value="`${locale('DarkWeb', 'contract_already_joined')}`"
          icon="pi pi-check"
          severity="success"
        />
        <Tag
          v-if="!contractModal.started"
          :value="`${locale(
            'DarkWeb',
            'contracts_item_starts_in'
          )}: ${formatStartTime(contractModal.starts)}`"
          icon="pi pi-clock"
          severity="info"
        />
        <Tag
          v-else
          :value="locale('DarkWeb', 'contracts_in_progress')"
          icon="pi pi-exclamation-triangle"
          severity="warning"
        />
      </div>
    </Dialog>
    <Dialog
      v-model:visible="cartModal"
      modal
      :header="locale('DarkWeb', 'cart')"
      :style="{ width: '25vw' }"
    >
      <DataTable :value="currentCart" v-if="currentCart.length > 0">
        <Column
          field="title"
          :header="locale('DarkWeb', 'column_item')"
        ></Column>
        <Column field="amount" :header="locale('DarkWeb', 'column_amount')">
          <template #body="slotProps"> {{ slotProps.data.amount }}x </template>
        </Column>
        <Column
          field="totalPrice"
          :header="locale('DarkWeb', 'column_total_price')"
        >
          <template #body="slotProps">
            ${{ slotProps.data.totalPrice }}
          </template>
        </Column>
        <Column field="" header="">
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              severity="secondary"
              text
              rounded
              @click="removeFromCart(slotProps.data.item, 1)"
            />
          </template>
        </Column>
      </DataTable>
      <h4 v-else>{{ locale("DarkWeb", "cart_empty") }}</h4>
      <div
        style="
          display: flex;
          gap: 0.5vw;
          justify-content: flex-end;
          margin-top: 2vh;
        "
      >
        <Button
          type="button"
          :label="locale('DarkWeb', 'close')"
          severity="secondary"
          @click="cartModal = false"
        ></Button>
        <Button
          type="button"
          :label="locale('DarkWeb', 'buy')"
          @click="buyCart()"
          v-if="currentCart.length > 0"
        />
      </div>
    </Dialog>
    <Dialog
      v-model:visible="currentTask"
      modal
      :header="currentTask ? currentTask.title : ''"
      :style="{ width: '25vw' }"
    >
      <div>{{ currentTask.description }}</div>
      <h4 v-if="currentTask.started" style="margin-bottom: 1vh">Progress</h4>
      <ProgressBar
        v-if="currentTask.started"
        :value="(currentTask.progress / currentTask.amount) * 100"
      >
        {{ currentTask.progress }} / {{ currentTask.amount }}</ProgressBar
      >
      <Button
        v-if="!currentTask.started"
        severity="success"
        type="button"
        :label="locale('DarkWeb', 'start')"
        style="margin-top: 3vh"
        @click="startTask"
      />
      <Button
        v-else-if="currentTask.progress >= currentTask.amount"
        severity="success"
        type="button"
        :label="locale('DarkWeb', 'finish')"
        style="margin-top: 3vh"
        @click="finishTask"
      />
      <div v-else-if="currentTask.type == 'giveItem'">
        <Button
          severity="primary"
          type="button"
          :label="locale('DarkWeb', 'give_items')"
          style="margin-top: 3vh"
          @click="giveTaskItems"
        />
        <Tag
          style="margin-left: 0.5vw"
          :value="`${locale('DarkWeb', 'required_item')}: ${
            currentTask.amount
          }x ${currentTask.item}`"
          severity="info"
        />
      </div>
    </Dialog>
    <ConfirmPopup />
    <div v-if="!currentDealer">
      <Panel class="contracts-panel" toggleable collapsed>
        <template #header>
          <div class="panel-header">
            <i class="pi pi-globe"></i>
            <span class="font-bold">{{ locale("DarkWeb", "contracts_panel_header") }}</span>
          </div>
        </template>
        <Carousel
          :value="filterContracts(contracts)"
          :numVisible="2"
          :numScroll="1"
        >
          <template #item="slotProps">
            <div class="UpgradeItem">
              <h3 style="display: flex; align-items: center; gap: 0.3vw">
                {{ slotProps.data.title }}
              </h3>
              <p>{{ slotProps.data.description }}</p>
              <div
                style="
                  margin-bottom: 1vh;
                  display: flex;
                  justify-content: space-between;
                "
              >
                <Tag
                  :value="slotProps.data.price"
                  icon="pi pi-wallet"
                  severity="warning"
                />
                <Tag
                  v-if="!slotProps.data.started"
                  :value="`${locale(
                    'DarkWeb',
                    'contracts_item_starts_in'
                  )}: ${formatStartTime(slotProps.data.starts)}`"
                  icon="pi pi-clock"
                  severity="info"
                />
                <Tag
                  v-else
                  :value="locale('DarkWeb', 'contracts_in_progress')"
                  icon="pi pi-exclamation-triangle"
                  severity="warning"
                />
              </div>
              <Button
                :label="locale('DarkWeb', 'contracts_item_view')"
                class="Button"
                @click="contractModal = slotProps.data"
              />
            </div>
          </template>
        </Carousel>
      </Panel>
    </div>
    
    <div class="DealersContainer" v-if="!currentDealer">
      <Card
        v-for="dealer in dealers"
        class="dealer-card"
      >
      <template #header>
          <div class="dealer-image">
            <img :src="`./dealers/${dealer.id}.webp`" />
            <div class="dealer-overlay"></div>
          </div>
        </template>
        <template #title>
          <h3 class="dealer-name">{{ dealer.name }}</h3>
        </template>
        <template #subtitle>
          <p class="dealer-description">{{ dealer.description }}</p>
        </template>
        <template #content>
          <div class="dealer-stats">
            <span>{{ locale("DarkWeb", "reputation") }}</span>
            <Tag
              severity="info"
              icon="pi pi-circle-fill"
              :value="`${dealer.reputation}/${dealer.maxReputation}`"
              class="reputation-tag"
            ></Tag>
          </div>
        </template>
        <template #footer>
          <Button
            :label="locale('DarkWeb', 'open')"
            class="dealer-button"
            @click="openDealer(dealer.id)"
          />
        </template>
      </Card>
    </div>
    <div class="DealerContainer" v-else>
      <div class="dealer-header">
        <Button
          icon="pi pi-angle-left"
          @click="currentDealer = null"
          class="back-button"
          rounded
        />
        <div class="dealer-info">
          <img :src="`./dealers/${selectedDealer.id}.webp`" />
          <h3>{{ selectedDealer.name }}</h3>
        </div>
        <div class="dealer-stats">
          <Tag
            severity="info"
            icon="pi pi-circle-fill"
            :value="`${selectedDealer.reputation}/${selectedDealer.maxReputation}`"
            class="reputation-tag"
          ></Tag>
          <Tag
            :value="globalState.myGang.value.coins.toString()"
            icon="pi pi-wallet"
            severity="warning"
            class="coins-tag"
          />
        </div>
      </div>

      
      <div class="dealer-panels">
    <!-- Tasks Panel -->
    <Panel class="tasks-panel" toggleable :toggleable="true" collapsed>
      <template #header>
        <div class="panel-header">
          <i class="pi pi-sitemap"></i>
          <span class="font-bold">{{ locale("DarkWeb", "tasks") }}</span>
        </div>
      </template>
      <div class="tasks-container">
        <Carousel
          v-if="selectedDealer.tasks.length > 0"
          :value="selectedDealer.tasks"
          :numVisible="selectedDealer.tasks.length < 3 ? selectedDealer.tasks.length : 3"
          :numScroll="1"
          class="tasks-carousel"
        >
          <template #item="slotProps">
            <div class="task-card">
              <div class="task-image-container">
                <img :src="getTaskImage(slotProps.data.id)" alt="Task Image" />
              </div>
              <div class="task-content">
                <h4>{{ slotProps.data.title }}</h4>
                <div class="task-rewards">
                  <Tag
                    v-if="slotProps.data.rewards.reputation"
                    severity="info"
                    icon="pi pi-circle-fill"
                    :value="slotProps.data.rewards.reputation"
                    class="reward-tag"
                  />
                  <Tag
                    v-if="slotProps.data.rewards.coins"
                    severity="warning"
                    icon="pi pi-wallet"
                    :value="slotProps.data.rewards.coins"
                    class="reward-tag"
                  />
                </div>
                <Button
                  label="View Details"
                  class="view-task-btn"
                  @click="openTask(slotProps.data)"
                />
              </div>
            </div>
          </template>
        </Carousel>
        <div v-else class="no-tasks">
          <i class="pi pi-inbox"></i>
          <h3>{{ locale("DarkWeb", "no_tasks_available") }}</h3>
        </div>
      </div>
    </Panel>

    <!-- Previous panels unchanged -->
    
    <!-- Upgrades Panel -->
    <Panel class="upgrades-panel" toggleable collapsed>
      <template #header>
        <div class="panel-header">
          <i class="pi pi-angle-double-up"></i>
          <span class="font-bold">{{ locale("DarkWeb", "upgrades") }}</span>
        </div>
      </template>
      <div class="upgrades-container">
        <Carousel
          :value="selectedDealer.upgrades"
          :numVisible="selectedDealer.upgrades.length < 2 ? selectedDealer.upgrades.length : 2"
          :numScroll="1"
          class="upgrades-carousel"
        >
          <template #item="slotProps">
            <div class="upgrade-card">
              <div class="upgrade-header">
                <h3>{{ slotProps.data.title }}</h3>
                <Tag
                  :value="`${slotProps.data.level + 1} LVL`"
                  severity="info"
                  class="level-tag"
                />
              </div>
              
              <div class="upgrade-content">
                <p class="upgrade-description">{{ slotProps.data.description }}</p>
                
                <div class="upgrade-price" v-if="slotProps.data.levels[slotProps.data.level + 1]">
                  <Tag
                    :value="slotProps.data.levels[slotProps.data.level + 1].price"
                    icon="pi pi-wallet"
                    severity="warning"
                    class="price-tag"
                  />
                </div>
                
                <div class="upgrade-action">
                  <Button
                    v-if="!slotProps.data.levels[slotProps.data.level + 1]"
                    :label="locale('DarkWeb', 'maxLevel')"
                    severity="success"
                    class="upgrade-button max-level"
                    disabled
                  />
                  
                  <Button
                    v-else-if="
                      slotProps.data.levels[slotProps.data.level + 1].requiredReputation > 
                      selectedDealer.reputation ||
                      !globalState.myGang.value.ranks[globalState.myUser.value.rank]?.permissions.dealers
                    "
                    icon="pi pi-lock"
                    severity="secondary"
                    class="upgrade-button locked"
                    disabled
                  />
                  
                  <Button
                    v-else-if="
                      slotProps.data.levels[slotProps.data.level + 1].price >
                      globalState.myGang.value.coins
                    "
                    icon="pi pi-wallet"
                    severity="danger"
                    class="upgrade-button insufficient"
                    disabled
                  />
                  
                  <Button
                    v-else
                    :label="locale('DarkWeb', 'upgrade')"
                    class="upgrade-button"
                    @click="upgrade(slotProps.data.id, $event)"
                  />
                </div>
              </div>
            </div>
          </template>
        </Carousel>
      </div>
    </Panel>
    <!-- <div class="dealer-panels"> -->
    <!-- Previous panels unchanged -->
    
    <!-- Shop Panel -->
    <Panel class="shop-panel" toggleable collapsed>
      <template #header>
        <div class="panel-header">
          <i class="pi pi-shopping-cart"></i>
          <span class="font-bold">{{ locale("DarkWeb", "shop") }}</span>
        </div>
      </template>
      
      <div class="shop-container">
        <Carousel
          :value="selectedDealer.shop"
          :numVisible="selectedDealer.shop.length < 3 ? selectedDealer.shop.length : 3"
          :numScroll="1"
          class="shop-carousel"
        >
          <template #item="slotProps">
            <div class="shop-card">
              <div class="shop-card-image">
                <img
                  :src="`https://images.dz-crew.com/inventory/icons/${slotProps.data.item}.png`"
                  :alt="slotProps.data.title"
                  class="item-image"
                />
              </div>
              
              <div class="shop-card-content">
                <h4 class="item-title">{{ slotProps.data.title }}</h4>
                <div class="item-actions">
                  <Tag
                    :value="`${slotProps.data.price}`"
                    severity="warning"
                    icon="pi pi-wallet"
                    class="price-tag"
                  />
                  <Button
                    icon="pi pi-shopping-cart"
                    class="add-to-cart-button"
                    @click="addToCart(slotProps.data.item, 1)"
                    severity="primary"
                  />
                </div>
              </div>
            </div>
          </template>
        </Carousel>
      </div>

      <template #footer>
        <div class="shop-footer">
          <Button
            icon="pi pi-shopping-cart"
            :label="locale('DarkWeb', 'cart')"
            severity="secondary"
            class="view-cart-button"
            @click="cartModal = true"
          />
        </div>
      </template>
    </Panel>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Main {
  width: 100%;
  color: white;
  padding: 0.2rem;
  min-height: 100vh;
  // background: linear-gradient(135deg, #0a0a0c 0%, #1a1a24 100%);
}

.modern-dialog {
  backdrop-filter: blur(10px);
  // background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  i {
    font-size: 1.5rem;
    color: #005091;
  }
}

.contracts-panel {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.DealersContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.dealer-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .dealer-image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .dealer-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    }
  }

  .dealer-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem;
    color: #fff;
  }

  .dealer-description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }

  .dealer-stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin: 1rem 0;
  }

  .dealer-button {
    width: 100%;
    background: #0965b1;
    border: none;
    padding: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      background: #535bf2;
      transform: translateY(-2px);
    }
  }
}

.DealerContainer {
  .dealer-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    margin-bottom: 2rem;

    .back-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .dealer-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      img {
        height: 48px;
        border-radius: 8px;
      }

      h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
    }

    .dealer-stats {
      margin-left: auto;
      display: flex;
      gap: 1rem;
    }
  }

  .dealer-panels {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .modern-panel {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }
  }
}

.ContractItem, .ShopItem, .UpgradeItem {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  img {
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  h4 {
    margin: 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .Tags {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .ButtonPriceContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
}

// Custom styling for PrimeVue components
:deep(.p-tag) {
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
}

:deep(.p-button) {
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

:deep(.p-carousel) {
  .p-carousel-indicators {
    margin-top: 1rem;
    
    .p-carousel-indicator button {
      background: rgba(255, 255, 255, 0.2);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      
      &.p-highlight {
        background: #646cff;
      }
    }
  }
}

.tasks-panel {
  // background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;

  :deep(.p-panel-header) {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.p-panel-content) {
    background: transparent;
    padding: 0;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  i {
    font-size: 1.5rem;
    color: #646cff;
  }

  span {
    font-size: 1.1rem;
    letter-spacing: 0.5px;
  }
}

.tasks-container {
  padding: 1.5rem;
}

.tasks-carousel {
  :deep(.p-carousel-container) {
    padding: 0.5rem;
  }

  :deep(.p-carousel-items-container) {
    margin: 0 -0.75rem;
  }
}

.task-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: 0 0.75rem;
  height: 100%;
  
  &:hover {
    // transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(100, 108, 255, 0.3);
  }

  .task-image-container {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    }
  }

  .task-content {
    padding: 1.25rem;

    h4 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #fff;
    }
  }

  .task-rewards {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.25rem;

    .reward-tag {
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      
      &:deep(.p-tag-icon) {
        margin-right: 0.4rem;
      }
    }
  }

  .view-task-btn {
    width: 100%;
    background: #646cff;
    border: none;
    padding: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background: #535bf2;
      // transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(100, 108, 255, 0.2);
    }
  }
}

.no-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  
  i {
    font-size: 2.5rem;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
}


.upgrades-panel {
  // background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;

  :deep(.p-panel-header) {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.p-panel-content) {
    background: transparent;
    padding: 0;
  }
}

.upgrades-container {
  padding: 1.5rem;
}

.upgrades-carousel {
  :deep(.p-carousel-container) {
    padding: 0.5rem;
  }

  :deep(.p-carousel-items-container) {
    margin: 0 -0.75rem;
  }
}

.upgrade-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 0 0.75rem;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(100, 108, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);
  }

  .upgrade-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    
    h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #fff;
    }

    .level-tag {
      font-size: 0.9rem;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      background: rgba(100, 108, 255, 0.2);
      border: 1px solid rgba(100, 108, 255, 0.3);
    }
  }

  .upgrade-content {
    .upgrade-description {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .upgrade-price {
      margin-bottom: 1.25rem;

      .price-tag {
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: rgba(255, 193, 7, 0.2);
        border: 1px solid rgba(255, 193, 7, 0.3);

        :deep(.p-tag-icon) {
          margin-right: 0.5rem;
        }
      }
    }

    .upgrade-action {
      .upgrade-button {
        width: 100%;
        padding: 0.8rem 1.2rem;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s ease;
        
        &:not(:disabled) {
          background: #646cff;
          border: none;
          
          &:hover {
            background: #535bf2;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(100, 108, 255, 0.2);
          }
        }

        &.max-level {
          background: rgba(40, 167, 69, 0.2);
          border: 1px solid rgba(40, 167, 69, 0.3);
          color: #28a745;
        }

        &.locked {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.5);
        }

        &.insufficient {
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #dc3545;
        }
      }
    }
  }
}


.shop-panel {
  // background: rgba(20, 20, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;

  :deep(.p-panel-header) {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.p-panel-content) {
    background: transparent;
    padding: 0;
  }

  :deep(.p-panel-footer) {
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 1.5rem;
  }
}

.shop-container {
  padding: 1.5rem;
}

.shop-carousel {
  :deep(.p-carousel-container) {
    padding: 0.5rem;
  }

  :deep(.p-carousel-items-container) {
    margin: 0 -0.75rem;
  }
}

.shop-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin: 0 0.75rem;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    // transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(100, 108, 255, 0.3);
    background: rgba(255, 255, 255, 0.05);

    .item-image {
      transform: scale(1.05);
    }
  }

  .shop-card-image {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .item-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 1rem;
      transition: transform 0.3s ease;
    }
  }

  .shop-card-content {
    padding: 1.25rem;

    .item-title {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
    }

    .item-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      .price-tag {
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: rgba(255, 193, 7, 0.2);
        border: 1px solid rgba(255, 193, 7, 0.3);
        flex-grow: 1;

        :deep(.p-tag-icon) {
          margin-right: 0.5rem;
        }
      }

      .add-to-cart-button {
        width: 42px;
        height: 42px;
        border-radius: 8px;
        background: #646cff;
        border: none;
        transition: all 0.2s ease;

        &:hover {
          background: #535bf2;
          // transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(100, 108, 255, 0.2);
        }

        :deep(.p-button-icon) {
          font-size: 1.1rem;
        }
      }
    }
  }
}

.shop-footer {
  display: flex;
  justify-content: flex-end;

  .view-cart-button {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
      // transform: translateY(-2px);
    }

    :deep(.p-button-icon) {
      margin-right: 0.5rem;
    }
  }
}
</style>