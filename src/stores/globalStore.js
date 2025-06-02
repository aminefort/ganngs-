import { ref } from 'vue';
import { createGlobalState } from '@vueuse/core';
import { fetchNui, isEnvBrowser, fetchBase64Image } from '../utils';

export const useGlobalState = createGlobalState(() => {
        const visible = ref(isEnvBrowser());
        const currentTab = ref("yourGang");
        const myGang = ref(null);

        const myUser = ref(null);
        const imagePath = ref("qb-inventory/html/images/");

        const canCreateGangSetting = ref(true);
        const canSeePoints = ref(true);
        const canSeeMemberCount = ref(true);

        const changeCurrentTab = (newTab) => {
            currentTab.value = newTab;
        };

        window.addEventListener("message", async (event) => {
            if (event.data.type == "visible") {
                visible.value = event.data.value;
            } else if (event.data.type == "myGang") {
                myGang.value = event.data.value;

                myGang.value.members.forEach(member => {
                    member.menuRef = undefined;
                });
            } else if (event.data.type == "myData") {
                myUser.value = event.data.value;
            } else if (event.data.type == "fetchBase64Image") {
                fetchNui("sendBase64Image", {
                    key: event.data.key, 
                    data: await fetchBase64Image(event.data.url)
                });
            } else if (event.data.type == "imagePath") {
                imagePath.value = event.data.value;
            } else if (event.data.type == "canCreateGang") {
                canCreateGangSetting.value = event.data.value;
            } else if (event.data.type == "canSeePoints") {
                canSeePoints.value = event.data.value;
            } else if (event.data.type == "canSeeMemberCount") {
                canSeeMemberCount.value = event.data.value;
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key == "Escape") {
                fetchNui("close");
            }
        })

        return { visible, currentTab, changeCurrentTab, myGang, myUser, imagePath, canCreateGangSetting, canSeePoints, canSeeMemberCount };
    }
);