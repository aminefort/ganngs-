import { mockGang, mockDealers, mockZoneData, mockContracts } from './mockData';

export const isEnvBrowser = () => !window.invokeNative;

export const noop = () => {};

export async function fetchNui(eventName, data) {
  if (isEnvBrowser()) {
    // Mock responses for browser testing
    switch (eventName) {
      case "getMyGang":
        return mockGang;
      case "getDealers":
        return mockDealers;
      case "getZoneData":
        return mockZoneData;
      case "getContracts":
        return mockContracts;
      case "close":
        return true;
      default:
        console.log('NUI call:', eventName, data);
        return null;
    }
  }

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data),
  };

  const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'nui-frame-app';

  const resp = await fetch(`https://${resourceName}/${eventName}`, options);

  const respFormatted = await resp.json();

  return respFormatted;
}

export function fetchBase64Image(url) {
  return fetch(url)
        .then(response => response.blob())
        .then(blob => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        });
};