<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CUSTOM_CRS } from "../atlas";
import { fetchNui } from "../utils";
import { useGlobalState } from "../stores/globalStore";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import locale from "../locale";

const confirm = useConfirm();
const toast = useToast();

const globalState = useGlobalState();

const map = ref(undefined);

const zoneData = ref();
const activeZone = ref(false);

const setupLeafletMap = () => {
  function latlngToGTA(latlng) {
    let lng = latlng[0] * 0.66 + 3755;
    let lat = latlng[1] * 0.66 + -5525;
    return L.latLng(lat, lng);
  }

  function calcUIPosition(pos) {
    return [latlngToGTA(pos[0]), latlngToGTA(pos[1])];
  }

  const crs = L.CRS.Simple;

  crs.scale = function (zoom) {
    return Math.pow(2, zoom) / Math.pow(2, 3) * 0.25;;
  };

  const AtlasStyle = L.tileLayer("./styleAtlas/{z}/{x}/{y}.png", {
    minZoom: 0,
    maxZoom: 5,
    noWrap: true,
    tms: true,
    id: "styleAtlas map",
  });

  map.value = L.map("map", {
    maxZoom: 5,
    minZoom: 3,
    layers: [AtlasStyle],
    crs: crs,
    center: [-5525, 3755],
    zoom: 4,
    attributionControl: false,
    zoomControl: false,
    maxBounds: L.latLngBounds([[-8192, 0], [0, 8192]]),
    preferCanvas: true,
  });

  map.value.fitBounds([latlngToGTA(zoneData.value.playerPos)]);

  Object.values(zoneData.value.zones).forEach((zone) => {
    zone.poly = zone.poly.map((latlng) => latlngToGTA(latlng));

    L.polygon(zone.poly, { color: "#" + zone.color, weight: 1, id: zone.id })
      .addTo(map.value)
      .on("click", onTerritoryClick);

    let canSee = globalState.canSeePoints.value;

    if (!canSee) {
      let highestInfluence = {gang: null, value: 0};
      Object.keys(zone.influence).forEach((gang) => {
        if (zone.influence[globalState.myGang.value.id] > highestInfluence.value) {
          highestInfluence.gang = gang;
          highestInfluence.value = zone.influence[globalState.myGang.value.id];
        }
      });

      if (highestInfluence.gang == globalState.myGang.value.id) {
        canSee = true;
      }
    }

    if (zone.locations && canSee) {
      if (zone.locations.StashHouse) {
        L.imageOverlay("https://cfx-nui-dc_gangs/web/icons/stashhouse.png", calcUIPosition(zone.locations.StashHouse.uiPosition), {
          interactive: true,
          zIndex: 100,
          position: zone.locations.StashHouse.position,
          title: "stash_house",
        })
          .addTo(map.value)
          .on("click", onUpgradeClick);
      }

      if (zone.locations.Grandma) {
        L.imageOverlay("https://cfx-nui-dc_gangs/web/icons/grandma.png", calcUIPosition(zone.locations.Grandma.uiPosition), {
          interactive: true,
          zIndex: 100,
          position: zone.locations.Grandma.position,
          title: "grandma",
        })
          .addTo(map.value)
          .on("click", onUpgradeClick);
      }

      if (zone.locations.Refinery) {
        L.imageOverlay("https://cfx-nui-dc_gangs/web/icons/refinery.png", calcUIPosition(zone.locations.Refinery.uiPosition), {
          interactive: true,
          zIndex: 100,
          position: zone.locations.Refinery.position,
          title: "refinery",
        })
          .addTo(map.value)
          .on("click", onUpgradeClick);
      }

      if (zone.locations.Protection) {
        L.imageOverlay("https://cfx-nui-dc_gangs/web/icons/protection.png", calcUIPosition(zone.locations.Protection.uiPosition), {
          interactive: true,
          zIndex: 100,
          position: zone.locations.Protection.position,
          title: "protection",
        })
          .addTo(map.value)
          .on("click", onUpgradeClick);
      }
    }
  });
};

onMounted(async () => {
  const data = await fetchNui("getZoneData");
  zoneData.value = data;
  setupLeafletMap();
});

const onTerritoryClick = (e) => {
  const clickedZone = e.target;

  if (!zoneData.value.zones[clickedZone.options.id]) return;
  activeZone.value = zoneData.value.zones[clickedZone.options.id];
};

const onUpgradeClick = (e) => {
  console.log("clicked")
  const clickedUpgrade = e.target;
  confirm.require({
    message: locale("Territories", "waypoint_confirm_title"),
    header: locale("Territories", clickedUpgrade.options.title),
    icon: "pi pi-exclamation-triangle",
    rejectLabel: locale("Territories", "no"),
    acceptLabel: locale("Territories", "yes"),
    accept: async () => {
      const data = await fetchNui("markUpgradePoint", clickedUpgrade.options.position);
      if (data) {
        toast.add({
            severity: "success",
            summary: locale("Territories", "waypoint_set"),
            detail: locale("Territories", "waypoint_set_description"),
            life: 3000,
        });
      }
    },
  });
};

const formatMeterGroup = () => {
  const data = [];
  if (!activeZone.value.influence) return data;
  Object.keys(activeZone.value.influence).forEach((gang) => {
    data.push({
      value: Math.round(activeZone.value.influence[gang] / activeZone.value.totalInfluence * 100),
      label: zoneData.value.gangs[gang].shortName,
      color: "#" + zoneData.value.gangs[gang].color,
    });
  });
  data.sort((a, b) => a.influence - b.influence);
  return data;
};

const doesPlayerGangOwnTheZone = () => {
  if (!activeZone.value.influence) return false;
  if (!globalState.myGang.value) return false;
  return activeZone.value.leader == globalState.myGang.value.id;
};
</script>

<template>
  <div class="Main">
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <Dialog
      v-model:visible="activeZone"
      modal
      :header="activeZone.label"
      :style="{ minWidth: '500px' }"
    >
      <div style="display: flex; flex-direction: column">
        <MeterGroup :value="formatMeterGroup()" />
      </div>
    </Dialog>
    <div id="map"></div>
  </div>
</template>

<style scoped lang="scss">
.Main {
  position: relative;
  width: 100%;
  color: white;
  border-radius: 0 0 2vh 2vh;
  overflow: hidden;
}

.UpgradeFlex {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .p-card-content {
    display: flex;
    flex-direction: column;

    div {
      margin-top: 1vh;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

#map {
border: 2px solid black ;
  width: 100%;
  height: 74vh;
  padding: 5%;
  transform: translateX(0%);
}
</style>
