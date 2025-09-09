
<script setup>
import { ref } from "vue"
import { storage, db } from "@/config/firebaseConfig"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"

const file = ref(null)
const downloadURL = ref(null)

const handleFileUpload = (e) => {
  file.value = e.target.files[0]
}

const uploadFile = async () => {

  if (!file.value) return alert("Please select a file")

  const fileRef = storageRef(storage, `uploads/${file.value.name}`)
  await uploadBytes(fileRef, file.value)
  const url = await getDownloadURL(fileRef)

  // Upload the file
  await uploadBytes(fileRef, file.value)

  // Get the file's download URL
  downloadURL.value = await getDownloadURL(fileRef)
  
  console.log(downloadURL.value)
}
</script>
<template>
  <div class="p-4">
    <input type="file" @change="handleFileUpload" />
    <button @click="uploadFile">Upload</button>

    <p v-if="downloadURL">File uploaded: 
      <a :href="downloadURL" target="_blank">View File</a>
    </p>
  </div>
</template>
