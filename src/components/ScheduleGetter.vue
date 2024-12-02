<script setup lang="js">
import { ref } from "vue";
import { VCardTitle } from 'vuetify/components';
import { httpClient } from '../stores/httpClient.ts';


const modes = [
    { text: "По преподавателю", value: "teacher" },
    { text: "По группе", value: "group" },
    { text: "По залу", value: "hall" }
];
const selectedMode = ref(modes[0].value);

function selectMode(mode) {
    selectedMode.value = mode;
}

// Список дней недели
const weekdays = [
    { title: "Пн", val: 1, key: "1" }, { title: "Вт", val: 2, key: "2" }, { title: "Ср", val: 3, key: '3' }, { title: "Чт", val: 4, key: "4" }, { title: "Пт", val: 5, key: "5" }, { title: "Сб", val: 6, key: "6" }, { title: "Вс", val: 7, key: "7" }];

// Список событий
const events = ref([
]);

// События по дням недели
const eventsByDay = computed(() =>
    weekdays.map((day) => ({
        day,
        events: events.value.filter((event) => event.weekDay === day.val),
    }))
);

async function changeTable() {
    events.value = []
    console.log(selectedMode.value, selectedTeacher, selectedHall, selectedGroup)
    let endpoint = "/lessons/"
    switch (selectedMode.value) {
        case 'teacher':
            endpoint += "teacher" + "/" + selectedTeacher.value.id
            break;
        case 'group':
            endpoint += "group" + "/" + selectedGroup.value.id
            break;
        case 'hall':
            endpoint += "halls" + "/" + selectedHall.value.id
            break;
    }
    try {
        const response = await httpClient.get(endpoint);
        events.value = response.data;
        convertEvents(events.value)
        console.log(events.value)
    } catch (error) {
        console.error("Ошибка загрузки событий:", error);
    }
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

function convertEvents(events) {
    for (let i = 0; i < events.length; i++) {
        const element = events[i];
        element.endTime = addMinutes(new Date("1970-01-01 " + element.startTime),
            element.duration).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) // Эта громадная строка делает добавляет к дате минуты и возвращает eё как строку HH:MM
        if (element.teacher.patronym == undefined) {
            element.teacher.patronym = ""
        }
        if (element.hall === undefined) {
            element.hall === ''
        }
    }
}

const endpointTeachers = "/teachers"
const endpointGroups = "/groups"
const endpointHalls = "/halls"

const teachers = ref([]);
const groups = ref([]);
const halls = ref([]);

const selectedHall = ref(null);
const selectedTeacher = ref(null);
const selectedGroup = ref(null);

// Кастомный фильтр для поиска по всем трём полям
function customFilter(item, queryText) {
    const searchText = queryText.toLowerCase();
    const fullName = `${item.lastName} ${item.firstName} ${item.patronym}`.toLowerCase();
    return fullName.includes(searchText);
}

async function getTeachers() {
    try {
        const response = await httpClient.get(endpointTeachers);
        teachers.value = response.data;
        for (let i = 0; i < teachers.value.length; i++) {
            teachers.value[i].dateOfBirth = new Date(teachers.value[i].dateOfBirth);
            teachers.value[i].fullName = teachers.value[i].lastName + " " + teachers.value[i].firstName + " " + teachers.value[i].patronym
        }

        console.log(teachers.value);
    } catch (error) {
        console.error("Ошибка загрузки преподавателей:", error);
    }
}

async function getGroups() {
    try {
        const response = await httpClient.get(endpointGroups);
        groups.value = response.data;
        console.log(groups.value)
    } catch (error) {
        console.error("Ошибка загрузки групп:", error);
    }
}

async function getHalls() {
    try {
        const response = await httpClient.get(endpointHalls);
        halls.value = response.data;
        console.log(halls.value)
    } catch (error) {
        console.error("Ошибка загрузки групп:", error);
    }
}

async function getAll() {
    getGroups()
    getTeachers()
    getHalls()
}

getAll()



watch(selectedGroup, changeTable)
watch(selectedTeacher, changeTable)
watch(selectedHall, changeTable)
</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="2">
                <v-sheet rounded="lg">
                    <v-list rounded="lg" color="indigo-lighten-1">
                        <v-list-item>
                            Тип расписания
                        </v-list-item>
                        <v-divider :thickness="3"></v-divider>
                        <v-list-item v-for="(mode, index) in modes" :key="index" :value="mode.value"
                            @click="selectMode(mode.value)" :active="selectedMode === mode.value" link>
                            <v-list-item-title class="card-title">{{ mode.text }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-sheet>
            </v-col>

            <!-- Таблица -->
            <v-col cols="10">
                <v-sheet min-height="40vh" rounded="lg" class="pa-4" elevation="10">
                    <div v-if="selectedMode === 'teacher'">
                        <v-autocomplete v-model="selectedTeacher" :items="teachers" item-title="fullName"
                            :filter="customFilter" label="Выберите преподавателя" color="indigo-lighten-1"
                            base-color="indigo" return-object v-on:update:model-value="changeTable"></v-autocomplete>
                    </div>
                    <div v-if="selectedMode === 'group'">
                        <v-autocomplete v-model="selectedGroup" :items="groups" item-title="name"
                            label="Выберите группу" return-object color="indigo-lighten-1"
                            base-color="indigo"></v-autocomplete>
                    </div>
                    <div v-if="selectedMode === 'hall'">
                        <v-autocomplete v-model="selectedHall" :items="halls" item-title="name" label="Выберите зал"
                            return-object color="indigo-lighten-1" base-color="indigo"></v-autocomplete>
                    </div>
                    <div v-if="selectedMode">
                        <v-card color="indigo">
                            <v-row class="weekdays-header">
                                <!-- Заголовки дней недели -->
                                <v-col v-for="(day, index) in weekdays" :key="index"
                                    class="text-center font-weight-bold weekday-header ">
                                    {{ day.title }}
                                </v-col>
                            </v-row>
                            <v-row class="events-grid ma-0">
                                <!-- Столбцы событий -->
                                <v-col v-for="(dayData, index) in eventsByDay" :key="index" class="day-cell">
                                    <v-card v-for="event in dayData.events" :key="event.title" class="mb-2"
                                        elevation="2" outlined density="compact">
                                        <v-card-title class="card-title">
                                            {{ event.name }}
                                        </v-card-title>
                                        <v-card-subtitle class="card-subtitle">
                                            {{ event.hall.name }} <br>
                                            {{ event.startTime }} - {{ event.endTime }}
                                        </v-card-subtitle>
                                        <v-card-text class="card-text">
                                            {{ `${event.teacher.lastName} ${event.teacher.firstName[0]}.
                                            ${event.teacher.patronym[0]}.` }}
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>


<style scoped>
.events-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    /* 7 равных столбцов */
    gap: 2px;
}

.day-cell {
    padding: 4px;
    min-height: 150px;
    max-width: 140px;
    /* ТАк делать не надо, на телефонах будет прям каша */
    border: 1px solid #e0e0e0;
    background-color: #f9f9f9;
}

.card-title {
    font-size: 0.9rem;
}

.card-subtitle {
    line-height: 1.2rem;
}

.card-text {
    padding-top: 0.3rem;
    font-size: 0.8rem;
}
</style>