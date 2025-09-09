<script setup>
import { ref } from 'vue'

const isFetchingData = ref(false)
const data = ref(null)

const fetchApiDog = async () => {
    isFetchingData.value = true

    fetch('https://dog.ceo/api/breeds/image/random')
        .then((response) => {
            return response.json()
        })
        .then((result) => {
            data.value = result
        })
        .catch((error) => {
            isFetchingData.value = false

            console.error('Error', error)
        })
}
</script>
<template>
    <div class="container flex p-9 rounded shadow-md">
        <img :src="data?.message" alt="" />
    </div>

    <button @click="fetchApiDog" class="rounded bg-blue-500 border-b-2 p-2 text-white font-bold">
        {{ isFetchingData ? 'Loading....' : 'Fetch Dog Data' }}
    </button>
</template>
