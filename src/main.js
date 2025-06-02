import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import "primevue/resources/themes/aura-dark-noir/theme.css";
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue, { ripple: true });

import Button from "primevue/button";
app.component('Button', Button);

import Menubar from 'primevue/menubar';
app.component('Menubar', Menubar);

import Card from 'primevue/card';
app.component('Card', Card);

import Chip from 'primevue/chip';
app.component('Chip', Chip);

import Tag from 'primevue/tag';
app.component("Tag", Tag);

import Panel from 'primevue/panel';
app.component("Panel", Panel);

import Menu from 'primevue/menu';
app.component("Menu", Menu);

import Dialog from 'primevue/dialog';
app.component("Dialog", Dialog);

import InputText from 'primevue/inputtext';
app.component("InputText", InputText);

import InputNumber from 'primevue/inputnumber';
app.component("InputNumber", InputNumber);

import Checkbox from 'primevue/checkbox';
app.component("Checkbox", Checkbox);

import Dropdown from 'primevue/dropdown';
app.component("Dropdown", Dropdown);

import Avatar from 'primevue/avatar';
app.component("Avatar", Avatar);

import ConfirmPopup from 'primevue/confirmpopup';
app.component("ConfirmPopup", ConfirmPopup);

import ConfirmDialog from 'primevue/confirmdialog';
app.component("ConfirmDialog", ConfirmDialog);

import Toast from 'primevue/toast';
app.component("Toast", Toast);

import ColorPicker from 'primevue/colorpicker';
app.component("ColorPicker", ColorPicker);

import ContextMenu from 'primevue/contextmenu';
app.component("ContextMenu", ContextMenu);

import MeterGroup from 'primevue/metergroup';
app.component("MeterGroup", MeterGroup);

import ProgressBar from 'primevue/progressbar';
app.component("ProgressBar", ProgressBar);

import Carousel from 'primevue/carousel';
app.component("Carousel", Carousel);

import DataTable from "primevue/datatable";
import Column from "primevue/column";

app.component("DataTable", DataTable);
app.component("Column", Column);

import ConfirmationService from 'primevue/confirmationservice';
app.use(ConfirmationService);

import ToastService from 'primevue/toastservice';
app.use(ToastService);

import Tooltip from 'primevue/tooltip';

app.directive('tooltip', Tooltip);

app.mount('#app');