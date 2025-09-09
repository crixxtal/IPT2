<script setup></script>
<template>
    <h1 class="text-2xl font-bold mb-4">Explore Communities</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Community card template repeated for multiple communities -->
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold"
                    >CS</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Computer Science Society</h3>
                    <p class="text-xs text-gray-500">1.2K members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                A community for computer science enthusiasts to discuss coding, algorithms, and
                emerging technologies. Share resources, ask questions, and collaborate on projects.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold"
                    >Bio</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Biology Club</h3>
                    <p class="text-xs text-gray-500">850 members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                Join us to explore the wonders of life science. From genetics to ecology, our
                members collaborate on research, share articles, and organize lab sessions.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-semibold"
                    >Art</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Arts Society</h3>
                    <p class="text-xs text-gray-500">620 members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                A haven for painters, sculptors, and creators of all kinds. Share your work, join
                art challenges, and organize exhibitions on campus.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-semibold"
                    >Math</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Mathematics Club</h3>
                    <p class="text-xs text-gray-500">950 members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                Delve into the world of numbers and theories. Participate in problem‑solving
                sessions, math competitions, and collaborative study groups.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold"
                    >Eco</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Environmental Club</h3>
                    <p class="text-xs text-gray-500">540 members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                Passionate about sustainability and conservation? Join us to participate in cleanup
                drives, awareness campaigns, and green initiatives around campus.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex flex-col">
            <div class="flex items-center space-x-3 mb-3">
                <span
                    class="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold"
                    >Lit</span
                >
                <div>
                    <h3 class="font-semibold text-gray-800">Literature Circle</h3>
                    <p class="text-xs text-gray-500">430 members</p>
                </div>
            </div>
            <p class="text-sm text-gray-600 flex-1">
                For lovers of books, poetry, and creative writing. Share recommendations, host
                readings, and collaborate on writing projects.
            </p>
            <div class="mt-4 flex justify-between items-center">
                <a href="#" class="text-indigo-600 hover:underline text-sm">View</a>
                <button
                    class="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                    Join
                </button>
            </div>
        </div>
    </div>
    <!-- Create Community CTA -->
    <div class="mt-8 bg-white rounded-lg shadow p-6 text-center">
        <h2 class="text-lg font-semibold mb-2">Want to start your own community?</h2>
        <p class="text-sm text-gray-600 mb-4">
            If you can’t find what you’re looking for, create a new community for your interest or
            study group.
        </p>
        <button class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Create Community
        </button>
    </div>
</template>
