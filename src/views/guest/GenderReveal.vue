<script setup>
import { ref } from 'vue'

const name = ref('')
const result = ref(null)

const isLoading = ref(false)

const revealGender = async () => {
    isLoading.value = true
    const url = `https://api.genderize.io/?name=${name.value}`

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            result.value = data
            isLoading.value = false
        })
        .catch((err) => {
            console.error(err)
        })
        .finally(() => {
            isLoading.value = false
        })
}
</script>
<template>
    <div class="container w-full h-screen flex items-center justify-center">
        <div
            class="bg-gray-100 p-9 rounded shadow-md flex flex-col items-center justify-center w-1/3"
        >
            Gender: {{ result?.gender }} Name: {{ result?.name }}
            <div class="w-full">
                <h4 class="text-2xl mb-2">Name:</h4>
                <input
                    v-model="name"
                    type="text"
                    class="rounded border border-gray-500 bg-white w-full p-4"
                />
            </div>
            <button
                @click="revealGender"
                class="rounded bg-green-700 text-white mt-5 w-full py-3 font-bold cursor-pointer"
                :class="{ 'animate-pulse': isLoading }"
            >
                {{ isLoading ? 'Retrieving gender...' : 'Retrieve Gender' }}
            </button>
        </div>
    </div>
</template>
